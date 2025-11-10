export interface SurveyData {
  storeId: string;
  photoType: string;
  rating: number;
  store: string;
  name: string;
  phone: string;
  visitDate: string;
  photoSatisfaction: string;
  otherStaffResponse: string;
  howFound: string[];
  importantFactors: string[];
  feedback: string;
  store_id: string;
}

export interface LineMessageRequest {
  userId: string;
  surveyData: SurveyData;
} 