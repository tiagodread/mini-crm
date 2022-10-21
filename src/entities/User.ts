import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: number

    @Column({type: "text", nullable: false})
    name: string

    @Column({type: "text", nullable: false, unique: true})
    email: string

    @Column({type: "text", select: false, nullable: true})
    password: string

    @Column({name: 'password_reset_token', type: "text", select: false, nullable: true})
    passwordResetToken: string

    @Column({name: 'password_reset_expires', select: false, nullable: true})
    passwordResetExpires: Date

    @CreateDateColumn({name: 'created_at'})
    createdAt: Date

    @UpdateDateColumn({name: 'updated_at'})
    updatedAt: Date


}
