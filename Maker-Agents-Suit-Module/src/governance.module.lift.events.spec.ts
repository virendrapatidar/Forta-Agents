import { 
  Finding, 
  HandleTransaction, 
  TransactionEvent, 
  Log,
  createTransactionEvent,
  Receipt,
  Transaction,
  Block,
} from 'forta-agent';
import { 
  Set,
  createFinding, 
  provideLiftEventsListener as provider,
} from './governance.module.lift.events';

const alertId: string = "Test Finding";
const target: string = "0xA";
const topic: string = "0xFF";
const address: Set = {
  "0xB": true,
  "0xC": true,
  "0xD": true,
}

const listToSet = (...list: string[]): Set => {
  const set: Set = {};
  list.forEach((s:string) => set[s] = true);
  return set;
};

const createLog = (...topics: string[]): Log => {
  return {
    topics: topics,
  } as Log;
};

const createTxEvent = (addresses: Set, ...logs: Log[]): TransactionEvent => 
  createTransactionEvent({
    receipt: {
      logs: logs,
    } as Receipt,
    transaction: {} as Transaction,
    block: {} as Block,
    addresses: addresses,
  });

describe('Lift Events listener test suit', () => {
  const handleTransaction: HandleTransaction = provider(alertId, target, address, topic)

  it('Should return 0 findings if the target is not involve in the tx', async () => {
    const txEvent: TransactionEvent = createTxEvent(
      listToSet('0x1', '0x2'),
    );

    const findings: Finding[] = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([]);
  });

  it('Should return 0 findings if the event is not found', async () => {
    const txEvent: TransactionEvent = createTxEvent(
      listToSet('0x1', '0x2', target.toLowerCase()),
      createLog('0x11', '0x123'),
      createLog('0x22', '0x456', '0xCAFE'),
    );

    const findings: Finding[] = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([]);
  });

  it('Should return 0 findings if the address are known', async () => {
    const txEvent: TransactionEvent = createTxEvent(
      listToSet('0x1', '0x2', target.toLowerCase()),
      createLog(topic, '0xB', '0xC'),
      createLog(topic, '0xD', '0xB'),
      createLog(topic, '0xC', '0xD'),
    );

    const findings: Finding[] = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([]);
  });

  it('Should detect unknown addresses in the event', async () => {
    const txEvent: TransactionEvent = createTxEvent(
      listToSet('0x1', '0x2', target.toLowerCase()),
      createLog(topic, '0xB', '0xC1'),
      createLog(topic, '0xD2', '0xB'),
      createLog(topic, '0xC3', '0xD3'),
    );

    const findings: Finding[] = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([
      createFinding(alertId, '0xC1', 2),
      createFinding(alertId, '0xD2', 1),
      createFinding(alertId, '0xC3', 1),
      createFinding(alertId, '0xD3', 2),
    ]);
  });
});
