import Resume from "../models/Resume.js";
import ai from "../configs/ai.js";

//  controller for enhancing a resume professional summary

import { response } from "express";


// POST: /api.ai/enhace-pro-sum
export const enhanceProfessionalSummary = async (req, res) => {
    try {
        const {userContent} = req.body;

        if(!userContent){
            return res.status(400).json({message:'Missing required fields'})
        }
      const response = await  ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
    messages: [
        {   role: "system",
            content: "You are an expert in resume writing.Your task is to enhance the professional summary of  resume. The summary should e 1-2 sentence also highlihting key skills, experience and career objectives.Make it compelling and ATS-Friendly.and only retuen text no option or anything else." 
        },
        {
            role: "user",
            content: userContent,
        },
    ],
        })
        const enhancedContent = response.choices[0].message.content;
        return res.status(200).json({enhancedContent})
    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// controller for enhancing resume s job description
// POST: /api/ai/enhance-job-desc

export const enhanceJobDescription = async (req, res) => {
    try {
        const {userContent} = req.body;

        if(!userContent){
            return res.status(400).json({message:'Missing required fields'})
        }
      const response = await  ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
    messages: [
        {   role: "system",
            content: "You are an expert in resumr writing.Your task is to enhance the job description of aresume.The job descriptiom should be only in 1-2 sentence also highlitiing key responsibilities and achivements.Use action verbs and quantifiable results where possible.Make it ATS=Friendly.and only text no option or anything else" 
        },
        {
            role: "user",
            content: userContent,
        },
    ],
        })
        const enhancedContent = response.choices[0].message.content;
        return res.status(200).json({enhancedContent})
    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

//  controllr for uploading a resume to the database
// POST: /api/ai/upload-resume

export const uploadResume = async (req, res) => {
  try {
    const { resumeText, title } = req.body;
    const userId = req.userId;

    if (!resumeText || !title) {
      return res.status(400).json({
        message: "Title and resume text are required"
      });
    }

    const safeResumeText = resumeText.slice(0, 12000);

    const systemPrompt =
      "You are an expert AI agent that extracts structured resume data.";

    const userPrompt = `
Extract data from this resume and return ONLY valid JSON:

${safeResumeText}
`;

   const response = await ai.chat.completions.create({
  model: process.env.OPENAI_MODEL,
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ]
});


    const extractedData = response?.choices?.[0]?.message?.content;

    if (!extractedData) {
      return res.status(400).json({
        message: "AI returned empty response"
      });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(extractedData);
    } catch {
      return res.status(400).json({
        message: "AI returned invalid JSON"
      });
    }

    const newResume = await Resume.create({
      userId,
      title,
      ...parsedData
    });

    return res.status(200).json({
      resumeId: newResume._id
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};
