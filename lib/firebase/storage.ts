import { storage } from "./config"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

// Upload a product image and get the URL
export const uploadProductImage = async (file: File): Promise<string> => {
  const storageRef = ref(storage, `product-images/${Date.now()}_${file.name}`)
  const snapshot = await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(snapshot.ref)
  return downloadURL
}
