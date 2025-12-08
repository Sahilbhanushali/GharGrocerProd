

export function fetchImagePathFromENV(){
    return process.env.REACT_APP_BASE_IMAGE_PATH || "https://dashboard.ghargrocer.com/storage/"
}