import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookieState } from './useCookieState';
import { useLazyGetCaseDetailsQuery } from '@/features/manage-hearings/api/myCasesApis';

export const useIncompleteCaseHandler = (setValue: (field: string, value: any) => void) => {
  const navigate = useNavigate();
  const [getCookie, setCookie] = useCookieState();
  const [triggerCaseDetailsQuery, { data: caseDetailsData }] = useLazyGetCaseDetailsQuery();

  useEffect(() => {
    const handleIncompleteCase = async (caseInfo: any) => {
      if (!caseInfo) return;

      const { PlaintiffType, CaseNumber, UserType } = caseInfo;
      
      // Store case number in cookie for later use
      setCookie('caseId', CaseNumber);
      // Store the case type to control form visibility
      setCookie('incompleteCaseType', { UserType, PlaintiffType });

      // Fetch case details
      const userClaims = getCookie('userClaims');
      const userType = getCookie('userType');
      const mainCategory = getCookie('mainCategory')?.value;
      const subCategory = getCookie('subCategory')?.value;

      const userConfigs: any = {
        Worker: {
          UserType: userType,
          IDNumber: userClaims?.UserID,
        },
        Establishment: {
          UserType: userType,
          IDNumber: userClaims?.UserID,
          FileNumber: userClaims?.File_Number,
        },
        "Legal representative": {
          UserType: userType,
          IDNumber: userClaims?.UserID,
          MainGovernment: mainCategory || "",
          SubGovernment: subCategory || "",
        },
      };

      const result = await triggerCaseDetailsQuery({
        ...userConfigs[userType],
        CaseID: CaseNumber,
        AcceptedLanguage: userClaims?.AcceptedLanguage?.toUpperCase() || "EN",
        SourceSystem: "E-Services",
      });

      if (result.data?.CaseDetails) {
        const details = result.data.CaseDetails;
        
        // Navigate to claimant section
        navigate('/initiate-hearing/claimant');

        // Set the appropriate claimant status based on UserType and PlaintiffType
        if (UserType === "Worker" && PlaintiffType === "Self(Worker)") {
          // Worker creating case for themselves
          setValue('claimantStatus', 'principal');
          setValue('applicantType', 'principal');
          setValue('showOnlyPrincipal', true); // Flag to hide other options
        } else if ((UserType === "Worker" || UserType === "Embassy User") && PlaintiffType === "Agent") {
          // Agent or Embassy user creating case for plaintiff
          setValue('claimantStatus', 'representative');
          setValue('applicantType', 'representative');
          setValue('showOnlyRepresentative', true); // Flag to hide other options
        }
        
        // Populate form fields
        setValue('idNumber', details.PlaintiffId || '');
        setValue('hijriDate', details.PlaintiffHijiriDOB || '');
        setValue('userName', details.PlaintiffName || '');
        setValue('region', { value: details.Plaintiff_Region_Code || '', label: details.Plaintiff_Region || '' });
        setValue('city', { value: details.Plaintiff_City_Code || '', label: details.Plaintiff_City || '' });
        setValue('occupation', { value: details.Plaintiff_Occupation_Code || '', label: details.Plaintiff_Occupation || '' });
        setValue('gender', { value: details.Plaintiff_Gender_Code || '', label: details.Plaintiff_Gender || '' });
        setValue('nationality', { value: details.Plaintiff_Nationality_Code || '', label: details.Plaintiff_Nationality || '' });
        setValue('phoneNumber', details.Plaintiff_PhoneNumber || '');
      }
    };

    // Check for incomplete case in response
    const incompleteCase = getCookie('incompleteCase');
    if (incompleteCase?.CaseInfo?.[0]) {
      handleIncompleteCase(incompleteCase.CaseInfo[0]);
    }
  }, [getCookie, setCookie, setValue, navigate, triggerCaseDetailsQuery]);
}; 