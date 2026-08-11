export interface Creator {
  _id?: string;
  name?: string;
  image?: string;
}

export interface Place {
  id: string;
  image: string;
  title: string;
  description: string;
  address: string;
  creator?: Creator | string;
  location: {
    lat: number;
    lng: number;
  };
  creatorName?: string;
  creatorImage?: string;
  createdAt?: string;
}