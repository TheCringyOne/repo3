import cloudinary from "../lib/cloudinary.js";
import Announcement from "../models/announcement.model.js";

// Get all announcements
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("author", "name username profilePicture headline")
      .sort({ createdAt: -1 });

    res.status(200).json(announcements);
  } catch (error) {
    console.error("Error in getAnnouncements controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new announcement (admin only)
export const createAnnouncement = async (req, res) => {
  try {
    const { content, image } = req.body;
    let newAnnouncement;

    if (!content) {
      return res.status(400).json({ message: "El contenido es obligatorio" });
    }

    if (image) {
      const imgResult = await cloudinary.uploader.upload(image);
      newAnnouncement = new Announcement({
        author: req.user._id,
        content,
        image: imgResult.secure_url,
      });
    } else {
      newAnnouncement = new Announcement({
        author: req.user._id,
        content,
      });
    }

    await newAnnouncement.save();

    res.status(201).json(newAnnouncement);
  } catch (error) {
    console.error("Error in createAnnouncement controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete an announcement (admin only)
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcementId = req.params.id;

    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
      return res.status(404).json({ message: "Anuncio no encontrado" });
    }

    // Delete the image from cloudinary if it exists
    if (announcement.image) {
      await cloudinary.uploader.destroy(announcement.image.split("/").pop().split(".")[0]);
    }

    await Announcement.findByIdAndDelete(announcementId);

    res.status(200).json({ message: "Anuncio eliminado exitosamente" });
  } catch (error) {
    console.error("Error in deleteAnnouncement controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};