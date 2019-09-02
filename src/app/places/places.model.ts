export class Place {
  public placeId = Math.floor(100000 + Math.random() * 90000).toString();
  constructor(
    public userId: string,
    public id: string,
    public title: string,
    public description: string,
    public image: Blob,
    public price: number,
    public roomsAvailable: number,
    public availableFrom: Date,
    public availableTo: Date
  ) {}
}
