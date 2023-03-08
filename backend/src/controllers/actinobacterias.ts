import { RequestHandler } from "express";
import { ActinobacteriaModel } from "../models";
import createHttpError from 'http-errors';
import mongoose from "mongoose";
import { assertIsDefined } from "../utils/assertIsDefined";

export const getActinobacterias: RequestHandler =  async (req, res, next) => {
    const authenticatedUserId = req.session.userId;

    try {
        assertIsDefined(authenticatedUserId);

        const actinobacterias = await ActinobacteriaModel.find({userId: authenticatedUserId}).exec();
        res.status(200).json(actinobacterias);
    } catch (error) {
        next(error);
    }
}

export const getActinobacteria: RequestHandler =  async (req, res, next) => {
    const actinobacteriaId = req.params.actinobacteriaId;
    const authenticatedUserId = req.session.userId;

    try {
        assertIsDefined(authenticatedUserId);

        if (!mongoose.isValidObjectId(actinobacteriaId)) {
            throw createHttpError(400, "Invalid Actinobacteria Id");
        }

        const actinobacteria = await ActinobacteriaModel.findById(actinobacteriaId).exec();

        if (!actinobacteria) {
            throw createHttpError(404, "Actinobacteria not found");
        }

        if (!actinobacteria.userId.equals(authenticatedUserId)) {
            throw createHttpError(401, "You cannot access this actinobacteria");
        }

        res.status(200).json(actinobacteria);
    } catch (error) {
        next(error);
    }
}

export const getAllActinobacterias: RequestHandler = async (req, res , next) => {
    const authenticatedUserId = req.session.userId;

    try {
        assertIsDefined(authenticatedUserId);
        const actinobacterias = await ActinobacteriaModel.find().exec();
        res.status(200).json(actinobacterias);
    } catch (error) {
        next(error);
    }
}

interface CreateActinobacteriaBody {
    scientificName?: string;
    designation?: string;
}

export const createActinobacteria: RequestHandler<unknown, unknown, CreateActinobacteriaBody, unknown> = async (req, res, next) => {
    const {
        scientificName,
        designation
    } = req.body;

    const authenticatedUserId = req.session.userId;

    try {
        assertIsDefined(authenticatedUserId);

        if (!scientificName || !designation) {
            throw createHttpError(400, "Actinobacteria must have scientific name and designation");
        }

        const newActinobacteria = await ActinobacteriaModel.create({
            userId: authenticatedUserId,
            scientificName,
            designation
        });

        res.status(201).json(newActinobacteria);
    } catch (error) {
        next(error);
    }
}

interface UpdateActinobacteriaParams {
    actinobacteriaId: string;
}

interface UpdateActinobacteriaBody {
    scientificName?: string;
    designation?: string;
}

export const updateActinobacteria: RequestHandler<UpdateActinobacteriaParams, unknown, UpdateActinobacteriaBody, unknown> = async (req, res, next) => {
    const actinobacteriaId = req.params.actinobacteriaId;

    const {
        scientificName,
        designation
    } = req.body;

    const authenticatedUserId = req.session.userId;


    try {
        assertIsDefined(authenticatedUserId);

        if (!mongoose.isValidObjectId(actinobacteriaId)) {
            throw createHttpError(400, "Invalid Actinobacteria Id");
        }

        if (!scientificName || !designation) {
            throw createHttpError(400, "Actinobacteria must have scientific name and designation");
        }

        const actinobacteria = await ActinobacteriaModel.findById(actinobacteriaId).exec();

        if (!actinobacteria) {
            throw createHttpError(404, "Actinobacteria not found");
        }

        if (!actinobacteria.userId.equals(authenticatedUserId)) {
            throw createHttpError(401, "You cannot access this actinobacteria");
        }

        actinobacteria.scientificName = scientificName;
        actinobacteria.designation = designation;

        const updatedActinobacteria = await actinobacteria.save();

        res.status(200).json(updatedActinobacteria);
    } catch (error) {
        next(error);
    }
}

export const deleteActinobacteria: RequestHandler = async (req, res, next) => {
    const actinobacteriaId = req.params.actinobacteriaId;
    const authenticatedUserId = req.session.userId;

    try {
        assertIsDefined(authenticatedUserId);

        if (!mongoose.isValidObjectId(actinobacteriaId)) {
            throw createHttpError(400, "Invalid Actinobacteria Id");
        }

        const actinobacteria = await ActinobacteriaModel.findById(actinobacteriaId).exec();

        if (!actinobacteria) {
            throw createHttpError(404, "Actinobacteria not found");
        }

        if (!actinobacteria.userId.equals(authenticatedUserId)) {
            throw createHttpError(401, "You cannot access this actinobacteria");
        }

        await ActinobacteriaModel.deleteOne({_id: actinobacteriaId});

        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
}