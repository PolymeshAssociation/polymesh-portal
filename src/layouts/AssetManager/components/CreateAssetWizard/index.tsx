/* eslint-disable react/jsx-props-no-spreading */
import { useContext, useEffect, useState, useMemo } from 'react';
import {
  GenericPolymeshTransaction,
  InputStatType,
  MetadataType,
  StatType,
  UnsubCallback,
} from '@polymeshassociation/polymesh-sdk/types';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { useNavigate } from 'react-router-dom';
import WizardSidebar from './components/WizardSidebar';
import BasicInfoStep from './steps/BasicInfoStep';
import SecurityIdentifiersStep from './steps/SecurityIdentifiersStep';
import DocumentsStep from './steps/DocumentsStep';
import MetadataStep from './steps/MetadataStep';
import ClaimIssuersStep from './steps/ClaimIssuersStep';
import ComplianceRulesStep from './steps/ComplianceRulesStep';
import CollectionKeysStep from './steps/CollectionKeysStep';
import TransferRestrictionsStep from './steps/TransferRestrictionsStep';
import SettlementRestrictionsStep from './steps/SettlementRestrictionsStep';
import IssuanceStep from './steps/IssuanceStep';
import { WizardContainer, StepContainer } from './styles';
import { initialWizardData, WizardData } from './types';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { notifyError } from '~/helpers/notifications';
import { useTransactionStatus } from '~/hooks/polymesh';
import { useWindowWidth } from '~/hooks/utility';
import { PATHS } from '~/constants/routes';

const CreateAssetWizard = () => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { account } = useContext(AccountContext);
  const { isMobile } = useWindowWidth();
  const { handleStatusChange } = useTransactionStatus();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [assetData, setAssetData] = useState<WizardData>(initialWizardData);
  const [nextAssetId, setNextAssetId] = useState<string>('');
  const [isFinalStep, setIsFinalStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!account) return;
    const getNextAssetId = async () => {
      const assetId = await account.getNextAssetId();
      setNextAssetId(assetId);
    };
    getNextAssetId();
  }, [account]);

  const steps = useMemo(() => {
    if (assetData.fungibility === 'nonFungible') {
      return [
        { component: BasicInfoStep, label: 'Basic Information' },
        { component: CollectionKeysStep, label: 'Collection Keys' },
        { component: SecurityIdentifiersStep, label: 'Security Identifiers' },
        { component: DocumentsStep, label: 'Documents' },
        { component: MetadataStep, label: 'Metadata' },
        { component: ClaimIssuersStep, label: 'Claim Issuers' },
        { component: ComplianceRulesStep, label: 'Compliance Rules' },
        {
          component: SettlementRestrictionsStep,
          label: 'Settlement Restrictions',
        },
      ];
    }
    return [
      { component: BasicInfoStep, label: 'Basic Information' },
      { component: SecurityIdentifiersStep, label: 'Security Identifiers' },
      { component: DocumentsStep, label: 'Documents' },
      { component: MetadataStep, label: 'Metadata' },
      { component: ClaimIssuersStep, label: 'Claim Issuers' },
      { component: ComplianceRulesStep, label: 'Compliance Rules' },
      { component: IssuanceStep, label: 'Issuance' },
      {
        component: SettlementRestrictionsStep,
        label: 'Settlement Restrictions',
      },
      { component: TransferRestrictionsStep, label: 'Transfer Restrictions' },
    ];
  }, [assetData.fungibility]);

  useEffect(() => {
    setIsFinalStep(currentStep === steps.length - 1);
  }, [currentStep, steps.length]);

  const handleNext = async (data: Partial<WizardData>) => {
    const mergedAssetData = { ...assetData, ...data };
    setAssetData(mergedAssetData);
    setCompletedSteps((prev) => [...new Set([...prev, currentStep])]);

    if (isFinalStep && sdk) {
      setIsLoading(true);
      const {
        assetType,
        claimIssuers,
        complianceRules,
        documents,
        fungibility,
        isDivisible,
        metadata,
        securityIdentifiers,
        customAssetType,
        fundingRound,
        name,
        ticker,
        initialSupply,
        portfolioId,
        collectionKeys,
        transferRestrictions,
        requiredMediators,
        venueRestrictions,
      } = mergedAssetData;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const batchCalls: Array<GenericPolymeshTransaction<any, any>> = [];

      let unsubCb: UnsubCallback | undefined;

      const nextAsset = await sdk.assets.getFungibleAsset({
        assetId: nextAssetId,
        skipExistsCheck: true,
      });

      try {
        if (fungibility === 'fungible') {
          let initialStatistics: InputStatType[] = [];

          if (transferRestrictions.length > 0) {
            initialStatistics = await Promise.all(
              transferRestrictions.map(async (restriction) => {
                switch (restriction.type) {
                  case StatType.Count:
                  case StatType.Balance:
                    return { type: restriction.type };

                  case StatType.ScopedCount:
                  case StatType.ScopedBalance:
                    return {
                      type: restriction.type,
                      claimIssuer: {
                        issuer: await sdk.identities.getIdentity({
                          did: restriction.issuer,
                        }),
                        claimType: restriction.claimType.type,
                      },
                    };

                  default:
                    throw new Error('Unsupported restriction type');
                }
              }),
            );

            const addRestrictionsPromises = transferRestrictions.map(
              async (restriction) => {
                switch (restriction.type) {
                  case StatType.Count:
                    return nextAsset.transferRestrictions.count.addRestriction(
                      {
                        count: restriction.max,
                        exemptedIdentities: restriction.exemptedIdentities,
                        skipStatIsEnabledCheck: true,
                      },
                      {
                        skipChecks: {
                          agentPermissions: true,
                        },
                      },
                    );

                  case StatType.Balance:
                    return nextAsset.transferRestrictions.percentage.addRestriction(
                      {
                        percentage: restriction.max,
                        exemptedIdentities: restriction.exemptedIdentities,
                        skipStatIsEnabledCheck: true,
                      },
                      {
                        skipChecks: {
                          agentPermissions: true,
                        },
                      },
                    );

                  case StatType.ScopedCount:
                    return nextAsset.transferRestrictions.claimCount.addRestriction(
                      {
                        claim: restriction.claimType,
                        issuer: await sdk.identities.getIdentity({
                          did: restriction.issuer,
                        }),
                        max: restriction.max,
                        min: restriction.min,
                        exemptedIdentities: restriction.exemptedIdentities,
                        skipStatIsEnabledCheck: true,
                      },
                      {
                        skipChecks: {
                          agentPermissions: true,
                        },
                      },
                    );

                  case StatType.ScopedBalance:
                    return nextAsset.transferRestrictions.claimPercentage.addRestriction(
                      {
                        claim: restriction.claimType,
                        issuer: await sdk.identities.getIdentity({
                          did: restriction.issuer,
                        }),
                        max: restriction.max,
                        min: restriction.min,
                        exemptedIdentities: restriction.exemptedIdentities,
                        skipStatIsEnabledCheck: true,
                      },
                      {
                        skipChecks: {
                          agentPermissions: true,
                        },
                      },
                    );

                  default:
                    throw new Error('Unsupported restriction type');
                }
              },
            );

            const addRestrictionTxs = await Promise.all(
              addRestrictionsPromises,
            );
            batchCalls.push(...addRestrictionTxs);
          }

          const createFungibleAssetTx = await sdk.assets.createAsset({
            assetType: customAssetType || assetType,
            isDivisible,
            name,
            documents,
            fundingRound,
            initialStatistics,
            initialSupply,
            portfolioId,
            securityIdentifiers,
            ticker,
          });

          // Add createFungibleAssetTx to the beginning of the batch
          batchCalls.unshift(createFungibleAssetTx);
        } else {
          const createNftCollectionTx = await sdk.assets.createNftCollection({
            collectionKeys,
            nftType: customAssetType || assetType,
            documents,
            fundingRound,
            name,
            securityIdentifiers,
            ticker,
          });
          batchCalls.push(createNftCollectionTx);
        }

        if (claimIssuers.length) {
          const claimIssuerTx =
            await nextAsset.compliance.trustedClaimIssuers.add(
              {
                // TODO: remove once support for custom claims is fixed
                // @ts-expect-error customClaim objects not yet supported
                claimIssuers,
              },
              {
                skipChecks: {
                  agentPermissions: true,
                },
              },
            );
          batchCalls.push(claimIssuerTx);
        }

        if (metadata) {
          const registerMetadataPromises = metadata.map(
            async (metadataParams) => {
              if (metadataParams.id && 'value' in metadataParams) {
                const globalMetadataEntry = await nextAsset.metadata.getOne({
                  id: new BigNumber(metadataParams.id),
                  type: MetadataType.Global,
                });
                return globalMetadataEntry.set(
                  {
                    value: metadataParams.value,
                    details: metadataParams.details,
                  },
                  {
                    skipChecks: {
                      agentPermissions: true,
                    },
                  },
                );
              }
              return nextAsset.metadata.register(metadataParams, {
                skipChecks: {
                  agentPermissions: true,
                },
              });
            },
          );
          const registerMetadataTxs = await Promise.all(
            registerMetadataPromises,
          );
          registerMetadataTxs.forEach((tx) => {
            batchCalls.push(tx);
          });
        }

        if (complianceRules.requirements.length) {
          const setComplianceRulesTx =
            await nextAsset.compliance.requirements.set(complianceRules, {
              skipChecks: { agentPermissions: true },
            });
          batchCalls.push(setComplianceRulesTx);
        }

        if (requiredMediators.length) {
          const addMediatorTx = await nextAsset.addRequiredMediators(
            {
              mediators: requiredMediators,
            },
            {
              skipChecks: {
                agentPermissions: true,
              },
            },
          );
          batchCalls.push(addMediatorTx);
        }

        if (venueRestrictions) {
          const setVenueRestrictionsTx = await nextAsset.setVenueFiltering(
            venueRestrictions,
            {
              skipChecks: {
                agentPermissions: true,
              },
            },
          );
          batchCalls.push(setVenueRestrictionsTx);
        }

        if (batchCalls.length) {
          const batchTransaction = await sdk.createTransactionBatch({
            transactions: batchCalls,
          });

          unsubCb = batchTransaction.onStatusChange((transaction) =>
            handleStatusChange(transaction),
          );
          await batchTransaction.run();
          navigate(`${PATHS.ASSET_MANAGER}/${nextAssetId}`);
        }
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        if (unsubCb) unsubCb();
        setIsLoading(false);
      }
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <WizardContainer>
      <StepContainer>
        {(() => {
          const ActiveStep = steps[currentStep].component;
          return (
            <ActiveStep
              defaultValues={assetData}
              onComplete={(data) => {
                handleNext(data);
                console.log('Wizard Data:', { ...assetData, ...data });
              }}
              onBack={handleBack}
              nextAssetId={nextAssetId}
              isFinalStep={isFinalStep}
              setAssetData={setAssetData}
              isLoading={isLoading}
            />
          );
        })()}
      </StepContainer>
      {!isMobile && (
        <WizardSidebar
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          steps={steps}
          completedSteps={completedSteps}
        />
      )}
    </WizardContainer>
  );
};

export default CreateAssetWizard;
