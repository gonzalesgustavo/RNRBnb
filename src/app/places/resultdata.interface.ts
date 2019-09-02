/**************
  --> This handles the resulting reponse coming from firebase, this conforms to the format 
      desired in the views. 
*************/
export interface ResultDataInterface {
  availableFrom: string;
  availableTo: string;
  description: string;
  image: Blob;
  placeId: string;
  price: number;
  roomsAvailable: number;
  title: string;
  userId: string;
}
