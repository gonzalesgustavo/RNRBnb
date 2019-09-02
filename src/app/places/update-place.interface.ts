/**************
  --> This handles the post data that will be sent to firebase, the setup of the post argument format 
      desired. 
*************/

export interface UpdatePlaceInterface {
  placeId: string;
  title: string;
  description: string;
  image: Blob;
  price: number;
  roomsAvailable: number;
  availableFrom: Date;
  availableTo: Date;
}
