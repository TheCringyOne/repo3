import Notification from "../models/notification.model.js";

export const getUserNotifications = async (req, res) => {
	try {
		const notifications = await Notification.find({ recipient: req.user._id })
			.sort({ createdAt: -1 })
			.populate("relatedUser", "name username profilePicture")
			.populate("relatedPost", "content image");

		// Filtrar notificaciones que tengan relatedUser válido
		const validNotifications = notifications.filter(notification => {
			// Si la notificación tiene relatedUser, debe ser válido
			if (notification.relatedUser === null || notification.relatedUser === undefined) {
				return false;
			}
			return true;
		});
		
		// Limpiar notificaciones huérfanas de la base de datos
		const orphanNotifications = notifications.filter(notification => 
			notification.relatedUser === null || notification.relatedUser === undefined
		);
		
		if (orphanNotifications.length > 0) {
			console.log(`Found ${orphanNotifications.length} orphan notifications, cleaning up...`);
			const orphanIds = orphanNotifications.map(notif => notif._id);
			await Notification.deleteMany({ _id: { $in: orphanIds } });
		}

		res.status(200).json(validNotifications);
	} catch (error) {
		console.error("Error en el getUserNotifications controller:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const markNotificationAsRead = async (req, res) => {
	const notificationId = req.params.id;
	try {
		const notification = await Notification.findByIdAndUpdate(
			{ _id: notificationId, recipient: req.user._id },
			{ read: true },
			{ new: true }
		);

		if (!notification) {
			return res.status(404).json({ message: "Notification not found" });
		}

		res.json(notification);
	} catch (error) {
		console.error("Error en el markNotificationAsRead controller:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const deleteNotification = async (req, res) => {
	const notificationId = req.params.id;

	try {
		const result = await Notification.findOneAndDelete({
			_id: notificationId,
			recipient: req.user._id,
		});

		if (!result) {
			return res.status(404).json({ message: "Notification not found" });
		}

		res.json({ message: "Notificación borrada exitosamente" });
	} catch (error) {
		console.error("Error in deleteNotification controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};
