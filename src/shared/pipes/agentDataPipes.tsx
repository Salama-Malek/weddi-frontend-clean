interface TransformedData {
    mandateSource: string;
    agentName: string;
    identityNumber: string;
    identityTypeName: string;
    mandateStatus: string;
  }
  
  export function transformAgentData(data: any): TransformedData {
    // Extract from Agent section
    const mandateSource = data?.Agent?.MandateSource || '';
    const agentName = data?.Agent?.AgentName || '';
    const mandateStatus = data?.Agent?.MandateStatus || '';
    
    // Get first IdentityNumber from AgentDetails
    const identityNumber = data?.Agent?.AgentDetails?.[0]?.IdentityNumber || '';
    
    // Get IdentityTypeName from PartyList (first party)
    const identityTypeName = data?.PartyList?.[0]?.IdentityTypeName || '';
  
    return {
      mandateSource,
      agentName,
      identityNumber,
      identityTypeName,
      mandateStatus
    };
  }