import {Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Video} from "./Video";
import {Subject} from "./Subject";

@Entity('projects')
export class Project {
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: "text"})
    name: string
}