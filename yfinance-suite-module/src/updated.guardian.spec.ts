import { FindingSeverity, FindingType, Finding, HandleTransaction, TransactionEvent } from "forta-agent";
import provideUpdatedGuardianAgent from "./updated.guardian";
import { TestTransactionEvent, createAddress } from "forta-agent-tools";

const YEARN_VAULT_ADDRESS = createAddress("0x121212");
const EVENT_SIGNATURE = "UpdateGuardian(address)";

const createFinding = (): Finding => {
  return Finding.fromObject({
    name: "Yearn Finance Updated Guardian",
    description: "Detects Updated Guardian event on the wathced Yearn Vault",
    alertId: "NETHFORTA-23-6",
    type: FindingType.Suspicious,
    severity: FindingSeverity.Medium,
    metadata: {
      YearnVault: YEARN_VAULT_ADDRESS,
    },
  });
};

describe("Yearn Finance Updated Guardian Tests", () => {
  let handleTransaction: HandleTransaction;

  beforeAll(() => {
    handleTransaction = provideUpdatedGuardianAgent(YEARN_VAULT_ADDRESS);
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