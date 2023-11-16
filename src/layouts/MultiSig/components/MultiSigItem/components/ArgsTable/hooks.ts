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
  callIndex: string,
) => {
  const {
    api: { polkadotApi },
  } = useContext(PolymeshContext);
  const { multiSigAccountKey } = useMultiSigContext();

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
          formattedArgs = [
            {
              index: callIndex,
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
  }, [polkadotApi, rawArgs, multiSigAccountKey, id, module, call, callIndex]);

  return args;
};
