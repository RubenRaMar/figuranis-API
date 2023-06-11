import { type Request, type NextFunction, type Response } from "express";
import { Types } from "mongoose";
import type CustomRequestStructure from "./types";
import Figure from "../../../database/models/Figure.js";
import {
  statusCodeList,
  privateMessageList,
} from "../../utils/responseData/responseData.js";
import CustomError from "../../Classes/CustomError/CustomError.js";

export const getFigures = async (
  req: CustomRequestStructure,
  res: Response,
  next: NextFunction
) => {
  const {
    userId,
    query: { limit, skip, filter },
  } = req;

  const newLimit = Number(limit);
  const newSkip = Number(skip);

  let figureQuery = {};

  if (userId) {
    figureQuery = { user: userId };
  }

  if (filter === "true") {
    figureQuery = { ...figureQuery, purchased: "false" };
  }

  try {
    const figures = await Figure.find(figureQuery)
      .sort({ _id: -1 })
      .skip(newSkip)
      .limit(newLimit)
      .exec();

    const length = await Figure.where(figureQuery).countDocuments();

    res.status(statusCodeList.ok).json({ figures, length });
  } catch (error: unknown) {
    next(error);
  }
};

export const getFigureById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const figure = await Figure.find({ _id: id }).exec();

    if (!figure) {
      throw new CustomError(
        statusCodeList.notFound,
        privateMessageList.badRequest
      );
    }

    res.status(statusCodeList.ok).json({ figure });
  } catch (error) {
    next(error);
  }
};

export const deleteFigure = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const figureRemoved = await Figure.findByIdAndDelete(id).exec();

    if (!figureRemoved) {
      throw new CustomError(
        statusCodeList.notFound,
        privateMessageList.deleteError
      );
    }

    res.status(statusCodeList.ok).json({ message: privateMessageList.delete });
  } catch (error) {
    next(error);
  }
};

export const addFigure = async (
  req: CustomRequestStructure,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, body } = req;

    const addedFigure = await Figure.create({
      ...body,
      user: new Types.ObjectId(userId),
    });

    if (!addedFigure) {
      throw new CustomError(
        statusCodeList.badRequest,
        privateMessageList.addError
      );
    }

    res.status(statusCodeList.add).json({ figure: addedFigure });
  } catch (error) {
    next(error);
  }
};
