export interface ConverterPanelLocal {
  progress: {
    title: string;
    step: string;
  };
  steps: {
    upload: {
      title: string;
      subtitle: string;
      placeholder: string;
      supportedFormats: string;
      exampleImages: string;
    };
    style: {
      title: string;
      subtitle: string;
      selected: string;
    };
    video: {
      title: string;
      subtitle: string;
      promptLabel: string;
      promptPlaceholder: string;
    };
  };
  buttons: {
    previous: string;
    next: string;
    startConversion: string;
    generateVideo: string;
    continue: string;
    back: string;
    download: string;
    downloadImage: string;
    downloadVideo: string;
  };
  status: {
    uploading: string;
    processing: string;
    generatingVideo: string;
    uploadingToCloud: string;
    processingVideo: string;
    magic: string;
    imagePreview: string;
    videoPreview: string;
  };
  messages: {
    imageConversion: string;
    videoGeneration: string;
    estimatedTime: {
      image: string;
      video: string;
    };
    hint: string;
  };
  results: {
    imageCompleted: string;
    videoCompleted: string;
    originalImage: string;
    styleImage: string;
    styleVideo: string;
  };
  errors: {
    loadExampleFailed: string;
    imageLoadError: string;
    videoLoadError: string;
  };
  creditsDialog?: {
    title: string;
    imageRequired: string; // e.g., "Insufficient credits, image conversion requires at least {credits} credits."
    videoRequired: string; // e.g., similar with {credits}
    cancel: string;
    subscribe: string;
  };
}
