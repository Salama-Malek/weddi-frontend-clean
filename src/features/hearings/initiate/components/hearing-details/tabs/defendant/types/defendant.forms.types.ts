import { Option } from "@/shared/components/form/form.types";

export interface ExtendedEstablishmentDetails {
  EconomicActivity?: string;
  ZipCode?: string;
  Number700?: string;
  UnifiedSequenceno?: string;
  EstablishmentName?: string;
  EstablishmentID?: string;
  Area?: string;
  EstablishmentStatusID?: string;
  CRNumber?: string;
  Street?: string;
  ContactNumber?: string;
  OwnerEmailAddress?: string;
  FileNumber?: string;
  EstablishmentType?: string;

  Region?: string;
  Region_Code?: string;
  City?: string;
  City_Code?: string;

  region: Option | null;
  city: Option | null;
}

export interface EstablishmentState {
  status: "idle" | "loading" | "success" | "error" | "not_found";
  data: ExtendedEstablishmentDetails | null;
  originalValues: { fileNumber: string; crNumber: string };
  hasLoaded: boolean;
  lastRequestId: string;
}

export interface EstablishmentApiResponse {
  EstablishmentInfo: ExtendedEstablishmentDetails[];
  ServiceStatus: string;
  SuccessCode: string;
  SourceSystem: string;
  ErrorList?: any;
}

export interface DefendantFormFields {
  DefendantFileNumber: string;
  DefendantCRNumber: string;
  DefendantNumber700: string;
  DefendantEstablishmentName: string;
  defendantRegion: Option | null;
  defendantCity: Option | null;
  establishment_phoneNumber: string;
  EstablishmentData: any;
  Defendant_Establishment_data_NON_SELECTED: ExtendedEstablishmentDetails | null;
  defendantStatus: string;
  defendantDetails: string;
  main_category_of_the_government_entity: Option | null;
  subcategory_of_the_government_entity: Option | null;
}
