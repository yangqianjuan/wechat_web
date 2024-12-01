export class FileItem {
  constructor(params) {
    this.fileNames = params.fileList.join(';');
    this.status = params.status;
  }
}
