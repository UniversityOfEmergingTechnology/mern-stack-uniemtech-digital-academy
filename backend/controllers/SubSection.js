const { uploadMediaToCloudinary } = require("../utils/fileUploader");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");

exports.createSubSection = async (req, res) => {
  try {
    const { sectionId, title, description } = req.body;

    const video = req.files.video;

    if (!sectionId || !title || !description || !video) {
      return res.status(404).json({
        success: false,
        message: "All fields are required",
      });
    }

    const uploadDetails = await uploadMediaToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    const SubSectionDetails = await SubSection.create({
      title: title,
      timeDuration: `${uploadDetails.duration}`,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });

    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      { $push: { subSection: SubSectionDetails._id } },
      { new: true }
    )
      .populate("subSection")
      .exec();

    return res.status(200).json({
      success: true,
      message: "Subsection created successfully",
      data: updatedSection,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Not able to create a sub section",
    });
  }
};

exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, subSectionId, title, description } = req.body;
    const subSection = await SubSection.findById(subSectionId);

    if (!subSection) {
      return req.status(404).json({
        success: false,
        message: "Subsection not found",
      });
    }

    if (title !== undefined) {
      subSection.title = title;
    }
    if (description !== undefined) {
      subSection.description = description;
    }

    if (req.files && req.files.video !== undefined) {
      const video = req.files.video;
      const uploadDetails = await uploadMediaToCloudinary(
        video,
        process.env.FOLDER_NAME
      );

      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = `${uploadDetails.duration}`;
    }
    await subSection.save();

    const updatedSection = await Section.findById(sectionId)
      .populate("subSection")
      .exec();

    return res.json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Not able to update a sub section",
    });
  }
};

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    );

    const subSection = await SubSection.findByIdAndDelete({
      _id: subSectionId,
    });

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    const updatedSection = await Section.findById(sectionId)
      .populate("subSection")
      .exec();

    return res.json({
      success: true,
      message: "Subsection deleted",
      data: updatedSection,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Not able to delete a sub section",
    });
  }
};
