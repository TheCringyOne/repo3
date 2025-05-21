import JobPost from "../models/jobPost.model.js";

// Get all job posts
export const getJobPosts = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    const jobPosts = await JobPost.find(query)
      .populate("author", "name username profilePicture headline")
      .sort({ createdAt: -1 });

    res.status(200).json(jobPosts);
  } catch (error) {
    console.error("Error in getJobPosts controller:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Create a new job post (admin only)
export const createJobPost = async (req, res) => {
  try {
    const { 
      title, 
      company, 
      location, 
      description, 
      requirements, 
      salary, 
      contactEmail, 
      applicationDeadline,
      jobType 
    } = req.body;

    if (!title || !company || !location || !description || !jobType) {
      return res.status(400).json({ message: "Campos obligatorios incompletos" });
    }

    const newJobPost = new JobPost({
      author: req.user._id,
      title,
      company,
      location,
      description,
      requirements,
      salary,
      contactEmail,
      applicationDeadline,
      jobType
    });

    await newJobPost.save();

    res.status(201).json(newJobPost);
  } catch (error) {
    console.error("Error in createJobPost controller:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Get a single job post by ID
export const getJobPostById = async (req, res) => {
  try {
    const jobPostId = req.params.id;
    
    const jobPost = await JobPost.findById(jobPostId)
      .populate("author", "name username profilePicture headline");
      
    if (!jobPost) {
      return res.status(404).json({ message: "Oferta de trabajo no encontrada" });
    }
    
    res.status(200).json(jobPost);
  } catch (error) {
    console.error("Error in getJobPostById controller:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Update job post (admin only)
export const updateJobPost = async (req, res) => {
  try {
    const jobPostId = req.params.id;
    const updateData = req.body;
    
    const jobPost = await JobPost.findById(jobPostId);
    
    if (!jobPost) {
      return res.status(404).json({ message: "Oferta de trabajo no encontrada" });
    }
    
    // Only the author can update the job post
    if (jobPost.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "No autorizado para actualizar esta oferta" });
    }
    
    // Update only allowed fields
    const allowedFields = [
      'title', 'company', 'location', 'description', 'requirements', 
      'salary', 'contactEmail', 'applicationDeadline', 'status', 'jobType'
    ];
    
    const filteredData = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }
    
    const updatedJobPost = await JobPost.findByIdAndUpdate(
      jobPostId,
      filteredData,
      { new: true }
    ).populate("author", "name username profilePicture headline");
    
    res.status(200).json(updatedJobPost);
  } catch (error) {
    console.error("Error in updateJobPost controller:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Delete job post (admin only)
export const deleteJobPost = async (req, res) => {
  try {
    const jobPostId = req.params.id;
    
    const jobPost = await JobPost.findById(jobPostId);
    
    if (!jobPost) {
      return res.status(404).json({ message: "Oferta de trabajo no encontrada" });
    }
    
    // Only the author can delete the job post
    if (jobPost.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "No autorizado para eliminar esta oferta" });
    }
    
    await JobPost.findByIdAndDelete(jobPostId);
    
    res.status(200).json({ message: "Oferta de trabajo eliminada exitosamente" });
  } catch (error) {
    console.error("Error in deleteJobPost controller:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Change job post status (admin only)
export const changeJobStatus = async (req, res) => {
  try {
    const jobPostId = req.params.id;
    const { status } = req.body;
    
    if (!['active', 'closed', 'expired'].includes(status)) {
      return res.status(400).json({ message: "Estado no válido" });
    }
    
    const jobPost = await JobPost.findById(jobPostId);
    
    if (!jobPost) {
      return res.status(404).json({ message: "Oferta de trabajo no encontrada" });
    }
    
    // Only the author can change the job post status
    if (jobPost.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "No autorizado para actualizar esta oferta" });
    }
    
    jobPost.status = status;
    await jobPost.save();
    
    res.status(200).json({ message: "Estado de la oferta actualizado exitosamente", jobPost });
  } catch (error) {
    console.error("Error in changeJobStatus controller:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};