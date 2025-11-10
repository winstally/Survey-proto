export interface Store {
  store_id: string;
  name: string;
  googleReviewUrl: string;
  lineChannelId: string;
  lineChannelSecret: string;
  lineMessagingToken: string;
  region: 'kanto' | 'kyushu';
  lineCallbackUrl: string;
}

export const stores: Store[] = [
//非公開
] as const;

export const getStoreConfig = (storeName: string): Store | undefined => {
  return stores.find(store => store.name === storeName);
};