import cloudinary from "../config/cloudinary";

const extractPublicId = (url: string): string | null => {
  const match = url.match(/placepulse-updated\/([^/.]+)/);
  return match ? `placepulse-updated/${match[1]}` : null;
};

const deleteCloudinaryImage = async (publicId?: string | null): Promise<void> => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.log("Failed to clean up orphaned Cloudinary image:", err);
  }
};

export { deleteCloudinaryImage, extractPublicId };