import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  TransactionEvent,
} from "forta-agent";
import { provideHandleTransaction  } from "./agent";
import {
  TestTransactionEvent,
  createAddress,
  encodeFunctionCall,
} from "forta-agent-tools";
import { reportLossABI } from "./abi";
import { generateMockBuilder }from "./mockContract";


const poolAccountants = [ createAddress("0x0"), createAddress("0x1") ];
const strategyAddresses = [ createAddress("0x2"), createAddress("0x3") ];

const mockWeb3 = { eth: { Contract: generateMockBuilder(poolAccountants) } } as any;

const createFinding = (strategyAddress: string, lossValue: string): Finding => {
  return Finding.fromObject({
    name: "Loss Reported",
    description: "A loss was reported by a V3 strategy",
    alertId: "Vesper2",
    type: FindingType.Info,
    severity: FindingSeverity.Info,
    metadata: {
      strategyAddress: strategyAddress,
      lossValue: lossValue,
    },
  });
};

describe("Reported Loss Agent", () => {
  let handleTransaction: HandleTransaction;

  it("should return empty findings if not reportLoss is called", async () => {
    handleTransaction = provideHandleTransaction(mockWeb3);

    let findings: Finding[] = [];

    const txEvent: TransactionEvent = new TestTransactionEvent();

    findings = findings.concat(await handleTransaction(txEvent));

      expect(findings).toStrictEqual([]);
  });

  it("should returns finding if reportLoss was called", async () => {
    handleTransaction = provideHandleTransaction(mockWeb3);

    let findings: Finding[] = [];

    const txEvent: TransactionEvent = new TestTransactionEvent().addTraces({
      input: encodeFunctionCall(reportLossABI as any, [
        strategyAddresses[0],
        "100",
      ]),
      to: poolAccountants[1],
    });

    findings = findings.concat(await handleTransaction(txEvent));

    expect(findings).toStrictEqual([
      createFinding(strategyAddresses[0], "100"),
    ]);
  });

  it("should returns multiple findings if reportLoss was called multiple times", async () => {
    handleTransaction = provideHandleTransaction(mockWeb3);

    let findings: Finding[] = [];

    const txEvent: TransactionEvent = new TestTransactionEvent()
      .addTraces({
        input: encodeFunctionCall(reportLossABI as any, [
          strategyAddresses[0],
          "100",
        ]),
        to: poolAccountants[0]
      })
      .addTraces({
        input: encodeFunctionCall(reportLossABI as any, [
          strategyAddresses[1],
          "150",
        ]),
        to: poolAccountants[1]
      });

    findings = findings.concat(await handleTransaction(txEvent));

    expect(findings).toStrictEqual([
      createFinding(strategyAddresses[0], "100"),
      createFinding(strategyAddresses[1], "150"),
    ]);
  });

  it("should returns empty findings if reportLoss wasn't called in the correct contract", async () => {
    handleTransaction = provideHandleTransaction(mockWeb3);

    let findings: Finding[] = [];

    const txEvent: TransactionEvent = new TestTransactionEvent().addTraces({
      input: encodeFunctionCall(reportLossABI as any, [
        strategyAddresses[0],
        "100",
      ]),
      to: createAddress("0x4")
    });

    findings = findings.concat(await handleTransaction(txEvent));

    expect(findings).toStrictEqual([]);
  })
});
