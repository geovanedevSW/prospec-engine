import { Repository } from '../src/persistence/database.js';
import { VercelDeployer } from '../src/services/vercelDeployer.js';

async function test() {
  const leadId = '92021262-3b29-4e09-8444-ac24aa9f76b3'; // Espaço Dellas
  const lead = Repository.getLeadById(leadId);
  console.log('Lead found:', lead?.name);

  const protos = Repository.getPrototypesByLead(leadId);
  console.log('Prototypes count:', protos.length);

  const proto = protos.find(p => p.previewHtml && p.previewHtml.trim().length > 0) || protos[0];
  console.log('Using prototype:', proto?.id, 'HTML len:', proto?.previewHtml?.length);

  // Deploy (offline / token check)
  const result = await VercelDeployer.deploy(proto.previewHtml || '', {
    projectName: lead?.name || 'espaco-dellas',
    lead: lead || undefined
  });

  console.log('Deploy result:');
  console.log(JSON.stringify(result, null, 2));
}

test().catch(console.error);
