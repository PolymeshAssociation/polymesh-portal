import { useState, useContext, useEffect } from 'react';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useMultiSigContext } from '~/context/MultiSigContext';
import {
  TMultiSigArgs,
  TMultiSigCall,
  TMultiSigCallArgs,
  TMultiSigArgsFormatted,
} from '../../../../types';

export const useMultiSigItemArgs = (
  id: number,
  module: string,
  call: string,
  rawArgs: TMultiSigArgs,
) => {
  const {
    api: { polkadotApi },
  } = useContext(PolymeshContext);
  const { accountKey } = useMultiSigContext();

  console.log(rawArgs);

  const [args, setArgs] = useState<TMultiSigArgsFormatted[] | TMultiSigArgs>(
    [],
  );

  useEffect(() => {
    if (!polkadotApi || !rawArgs) {
      return;
    }
    (async () => {
      let formattedArgs;
      try {
        if ((rawArgs.calls as TMultiSigCallArgs[])?.length) {
          formattedArgs = await Promise.all(
            (rawArgs.calls as TMultiSigCallArgs[]).map(
              (rawCall: { callIndex: string; args: TMultiSigCall }) => {
                const detail = polkadotApi?.findCall(rawCall.callIndex);
                return {
                  index: rawCall.callIndex,
                  module: detail?.section,
                  call: detail?.method,
                  args: rawCall.args,
                };
              },
            ),
          );
        } else {
          const data = await polkadotApi?.query.multiSig.proposals(
            accountKey,
            id,
          );
          const propData = data?.isSome && data.unwrap().toJSON();
          formattedArgs = [
            {
              index: (propData as TMultiSigCallArgs)?.callIndex,
              module,
              call,
              args: rawArgs,
            },
          ];
        }
      } catch (err) {
        setArgs(rawArgs);
      } finally {
        setArgs(formattedArgs as TMultiSigArgsFormatted[]);
      }
    })();
  }, [polkadotApi, rawArgs, accountKey, id, module, call]);

  return args;
};
