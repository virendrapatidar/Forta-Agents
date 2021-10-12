import { FindingType, FindingSeverity, Finding, HandleTransaction, TransactionEvent } from "forta-agent";
import provideUpdatedGovernanceAgent from "./updated.governance";
import { TestTransactionEvent, createAddress } from "forta-agent-tools";

const YEARN_VAULT_ADDRESS = createAddress("0x121212");
const ALERT_ID = "testID";
const EVENT_SIGNATURE = "UpdateGovernance(address)";

const createFinding = (): Finding => {
  return Finding.fromObject({
    name: "Yearn Finance Updated Governance",
    description: "Detects Updated Governance event on the watched Yearn Vault",
    alertId: ALERT_ID,
    type: FindingType.Suspicious,
    severity: FindingSeverity.Medium,
    metadata: {
      YearnVault: YEARN_VAULT_ADDRESS,
    },
  });
};

describe("Yearn Finance Updated Governance Tests", () => {
  let handleTransaction: HandleTransaction;

  beforeAll(() => {
    handleTransaction = provideUpdatedGovernanceAgent(YEARN_VAULT_ADDRESS, ALERT_ID);
  });

  it("should return empty findings if the expected event wasn't called", async () => {
    const txEvent: TransactionEvent = new TestTransactionEvent().addEventLog("badEvent", YEARN_VAULT_ADDRESS);

    const findings: Finding[] = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([]);
  });

  it("should return empty findings if the event is not related with the specified vault", async () => {
    const txEvent: TransactionEvent = new TestTransactionEvent().addEventLog(EVENT_SIGNATURE, createAddress("0x0"));

    const findings: Finding[] = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([]);
  });

  it("should return findings when the specified vault emit the expected event", async () => {
    const txEvent: TransactionEvent = new TestTransactionEvent().addEventLog(EVENT_SIGNATURE, YEARN_VAULT_ADDRESS);

    const findings: Finding[] = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([createFinding()]);
  });
});
