/**************
  --> Module for the shared components like pickers etc. 
*************/
import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ImagePickerComponent } from "./pickers/image-picker/image-picker.component";

@NgModule({
  declarations: [ImagePickerComponent],
  imports: [CommonModule, IonicModule],
  exports: [ImagePickerComponent],
  entryComponents: [ImagePickerComponent]
})
export class SharedModule {}
