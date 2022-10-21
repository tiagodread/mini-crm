import {AppDataSource} from "../data-source";
import {Project} from "../entities/Project";
export const projectRepository = AppDataSource.getRepository(Project)