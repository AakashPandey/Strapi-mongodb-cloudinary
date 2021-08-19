'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {

    async create(ctx) {
        let entity;
        if (ctx.is('multipart')) {
            const { data, files } = parseMultipartData(ctx);
            data.posted_by = ctx.state.user.id;
            entity = await strapi.services.post.create(data, { files });
        } else {
            ctx.request.body.posted_by = ctx.state.user.id;
            entity = await strapi.services.post.create(ctx.request.body);
        }
        return sanitizeEntity(entity, { model: strapi.models.post });
    },

    async update(ctx) {
        const { id } = ctx.params;

        let entity;

        const [post] = await strapi.services.post.find({
            id: ctx.params.id,
            'posted_by.id': ctx.state.user.id,
        });
        
        // in request read the liked_by part, this has id of user wanting to toggle like
        // validate if logged in user id and this id is same or different
        
        // if both are same then go ahead else err
       
        // if resource has incoming id, edit resource and remove incoming id (remove like)
        // else go with flow (add like)
        
        if(ctx.request.body.liked_by!==undefined) {
            const wantsToggleLike = ctx.state.user.id;
            console.log(`Logged in user: ${wantsToggleLike}`);
    
            const toggleData = ctx.request.body.liked_by.replace('[','').replace(']', '');
            //console.log(ctx.request.body);
            console.log(`Like Toggle user: ${toggleData}`);

            const postRef= await strapi.services.post.find({
                id: ctx.params.id,
            })
    
            if(wantsToggleLike.toString() !== toggleData.toString()) {
                return ctx.unauthorized(`You can't update this entry [like protection]`);
            }

            const allLikes = postRef[0].liked_by;

            let like = true;
            
            for(let i = 0; i < allLikes.length; i++) {
                if (allLikes[i].id === wantsToggleLike) {
                    allLikes.splice(i, 1);
                    like = false;
                    break;
                }
            }

            const updatedLikes = [];

            allLikes.forEach(e => {
                updatedLikes.push(e.id);
            });

            if(like) {
                updatedLikes.push(wantsToggleLike);
            }

            console.log(`updated likes \n${updatedLikes}`);
            ctx.request.body.liked_by = updatedLikes;
            
        }

        let likeEvent = Object.keys(ctx.request.body);
        

        if (!post && !likeEvent.length===1 && !likeEvent.includes('liked_by')) {
            return ctx.unauthorized(`You can't update this entry [edit protection]`);
        }

        if (ctx.is('multipart')) {
            const { data, files } = parseMultipartData(ctx);
            entity = await strapi.services.post.update({ id }, data, {
                files,
            });
        } else {
            entity = await strapi.services.post.update({ id }, ctx.request.body);
        }

        return sanitizeEntity(entity, { model: strapi.models.post });
    },

};
