import { ImageSource } from '@nativescript/core';
import { getStorage, ref, uploadBytes, getDownloadURL } from '@nativescript/firebase-storage';
import * as imagepicker from '@nativescript/imagepicker';

export class MediaService {
    private storage = getStorage();

    async pickImage(): Promise<string> {
        const context = imagepicker.create({
            mode: 'single',
            mediaType: imagepicker.ImagePickerMediaType.Image
        });

        const selection = await context.present();
        if (selection.length > 0) {
            const imageAsset = selection[0];
            const imageSource = await ImageSource.fromAsset(imageAsset);
            return this.uploadImage(imageSource);
        }
        return null;
    }

    async pickVideo(): Promise<string> {
        const context = imagepicker.create({
            mode: 'single',
            mediaType: imagepicker.ImagePickerMediaType.Video,
            maxDuration: 60 // 60 seconds max
        });

        const selection = await context.present();
        if (selection.length > 0) {
            const videoAsset = selection[0];
            return this.uploadVideo(videoAsset);
        }
        return null;
    }

    private async uploadImage(imageSource: ImageSource): Promise<string> {
        const fileName = `images/${Date.now()}.jpg`;
        const storageRef = ref(this.storage, fileName);
        
        const response = await fetch(imageSource.toBase64String('jpg'));
        const blob = await response.blob();
        
        await uploadBytes(storageRef, blob);
        return getDownloadURL(storageRef);
    }

    private async uploadVideo(videoAsset: any): Promise<string> {
        const fileName = `videos/${Date.now()}.mp4`;
        const storageRef = ref(this.storage, fileName);
        
        const videoData = await videoAsset.getVideoData();
        await uploadBytes(storageRef, videoData);
        return getDownloadURL(storageRef);
    }
}