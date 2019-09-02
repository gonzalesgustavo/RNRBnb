import { Platform } from "@ionic/angular";
import {
  Plugins as device,
  Capacitor,
  CameraSource,
  CameraResultType
} from "@capacitor/core";
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  Input
} from "@angular/core";
import { Images } from "src/app/Helpers/images.helpers";

@Component({
  selector: "app-image-picker",
  templateUrl: "./image-picker.component.html",
  styleUrls: ["./image-picker.component.scss"]
})
export class ImagePickerComponent implements OnInit {
  //get reference to the input should the app be run on a desktop
  @ViewChild("filePicker") filePickerRef: ElementRef<HTMLInputElement>;
  //pass file (reference to file) out
  @Output() imagePick = new EventEmitter<string>();
  //show preview
  @Input() showPreview = false;
  //image convered to base64 string to be passed to component where it is needed
  selectedImage: string;
  //check if this application is running on a desktop
  usePicker: boolean = false;

  constructor(private platform: Platform) {}

  ngOnInit() {
    //check to see what platform the application is running on
    if (
      (this.platform.is("mobile") && !this.platform.is("hybrid")) ||
      this.platform.is("desktop")
    ) {
      this.usePicker = true;
    }
  }

  handleImagePicker() {
    if (!Capacitor.isPluginAvailable("Camera")) {
      //if the platform is on a desktop open the file picker instead of the camera
      this.filePickerRef.nativeElement.click();
      return;
    }
    //get photograph from camera or from their phones local storage (image library)
    device.Camera.getPhoto({
      quality: 50,
      source: CameraSource.Prompt,
      correctOrientation: true,
      width: 200,
      resultType: CameraResultType.Base64
    })
      .then(image => {
        this.selectedImage = image.base64String;
        this.imagePick.emit(this.selectedImage);
      })
      .catch(error => {
        console.log(error);
        if (this.filePickerRef) {
          this.filePickerRef.nativeElement.click();
        }
        return false;
      });
  }
  handleFileChosen(event: Event) {
    //get file the user has submitted
    const file = (event.target as HTMLInputElement).files[0];
    //in case no file selected just return
    if (!file) {
      return;
    }
    //create an instance of a FileReader
    const fileReader = new FileReader();
    //setup the on load file which will return the base64 string
    fileReader.onload = () => {
      const dataUrl = fileReader.result.toString();
      this.imagePick.emit(dataUrl);
      this.selectedImage = dataUrl;
    };
    //read as base64 string
    fileReader.readAsDataURL(file);
  }
}
