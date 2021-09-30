import {
  Finding,
  HandleTransaction,
  FindingSeverity,
  FindingType,
  TransactionEvent,
} from 'forta-agent';
import Web3 from 'web3';
import provideRelyFunctionHandler from './rely.function';
import {
  createAddress,
  TestTransactionEvent,
} from '@nethermindeth/general-agents-module';
import { OSM_CONTRACTS } from './utils';

const ADDRESS = createAddress('0x1');
const ALERT_ID = 'testID';
const ABI = new Web3().eth.abi;

describe('OSM Rely Function Agent', () => {
  let handleTransaction: HandleTransaction;

  beforeAll(() => {
    handleTransaction = provideRelyFunctionHandler(OSM_CONTRACTS);
  });

  it('should return a finding for one of the OSM contract', async () => {
    const _from = createAddress('0x2');
    const _to = '0x81fe72b5a8d1a857d176c3e7d5bd2679a9b85763'; // PIP_ETH
    const _input: string = ABI.encodeFunctionCall(
      {
        name: 'rely',
        type: 'function',
        inputs: [
          {
            type: 'address',
            name: 'usr',
          },
        ],
      },
      [ADDRESS]
    );

    const txEvent: TransactionEvent = new TestTransactionEvent().addTrace({
      to: _to,
      from: _from,
      input: _input,
    });

    const findings: Finding[] = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: 'Maker OSM Contract RELY Function Agent',
        description: 'RELY Function is called',
        alertId: "MakerDAO-OSM-3",
        severity: FindingSeverity.Medium,
        type: FindingType.Unknown,
        metadata: {
          contract: _to,
        },
      }),
    ]);
  });

  it('should return empty finding when OSM contract address does found', async () => {
    const _from = createAddress('0x2');
    const _to = '0x1'; // BAD ADDRESS
    const _input: string = ABI.encodeFunctionCall(
      {
        name: 'rely',
        type: 'function',
        inputs: [
          {
            type: 'address',
            name: 'usr',
          },
        ],
      },
      [ADDRESS]
    );

    const txEvent: TransactionEvent = new TestTransactionEvent().addTrace({
      to: _to,
      from: _from,
      input: _input,
    });

    const findings: Finding[] = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([]);
  });
});
