export interface TransformHistoryLocal {
  title: string;
  filters: {
    all: string;
    status: string;
  };
  tabs: {
    all: string;
    image: string;
    video: string;
  };
  status: {
    PROCESSING: string;
    COMPLETED: string;
    FAILED: string;
  };
  taskType: {
    image: string;
    video: string;
  };
  details: {
    preview: string;
    hoverToPreview: string;
    videoLoadError: string;
    seconds: string;
    fileSize: string;
  };
  actions: {
    download: string;
    retry: string;
  };
  empty: {
    title: string;
    description: string;
  };
  loading: string;
  pagination: {
    showing: string;
    of: string;
    results: string;
    previous: string;
    next: string;
  };
}