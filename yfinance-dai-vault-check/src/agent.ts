import BigNumber from 'bignumber.js'
import { 
  Finding, 
  HandleTransaction, 
  TransactionEvent, 
} from 'forta-agent'
import { provideUpdatedGovernanceAgent, provideUpdatedGuardianAgent, provideEmergencyShutdownAgent } from "yfinance-suite-module";


const DAI_VAULT_ADDRESS = "0xdA816459F1AB5631232FE5e97a05BBBb94970c95";

const provideHandleTransaction = (yearnVaultAddress: string): HandleTransaction => {
  const updatedGovernanceHandler = provideUpdatedGovernanceAgent(yearnVaultAddress, "NETHFORTA-24");
  const updateGuardianHandler = provideUpdatedGuardianAgent(yearnVaultAddress, "NETHFORTA-25");
  const emergencyShutdownHandler = provideEmergencyShutdownAgent(yearnVaultAddress, "NETHFORTA-26");

  return async (txEvent: TransactionEvent): Promise<Finding[]> => {
    let findings: Finding[] = [];

    findings = findings.concat(await updatedGovernanceHandler(txEvent));
    findings = findings.concat(await updateGuardianHandler(txEvent));
    findings = findings.concat(await emergencyShutdownHandler(txEvent));

    return findings;
  }
}



export default {
  handleTransaction: provideHandleTransaction(DAI_VAULT_ADDRESS)
}