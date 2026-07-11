/** @type {import('mongoose').Model<any>} */
const Service = require('../models/service.model');
const statusText = require('../utils/statusText');
const appError = require('../utils/appError');
const asyncWrapper = require('../utils/asyncWrapper');


const getServices = asyncWrapper(async (req, res, next) => {
    
    const filter = {};
    const {search, category, sortByPrice} = req.query;
    if (search) 
        filter.title = {$regex: search, $options: 'i'};
    
    if (category) 
        filter.category = req.query.category;

    const sortOption = {};
    if (sortByPrice === 'low to high')
        sortOption.price = 1;
    else if (sortByPrice === 'high to low')
        sortOption.price = -1;

    const page = +req.query.page || 1;
    const limit = +req.query.limit || 10;
    const sanitizedPage = Math.max(page, 1); 
    const sanitizedLimit = Math.max(limit, 1);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const [services, totalServices] = await Promise.all([
        Service.find(filter, { __v: 0 })
            .sort(sortOption)
            .limit(sanitizedLimit)
            .skip(skip)
            .populate('seller', 'firstName lastName email avatar'),

            Service.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalServices / sanitizedLimit);

    res.json({
        status: statusText.SUCCESS,
        data: {     
            meta: {
                totalItems: totalServices,
                totalPages: totalPages,
                currentPage: sanitizedPage,
                limit: sanitizedLimit
            },
            services
        }
    });
});

const createService = asyncWrapper (async (req, res, next)=>{
    const {category, title, description, price} = req.body;
    const sellerId = req.userData.id;    

        const newService = new Service({
            category,
            title,
            description,
            price,
            seller: sellerId
        });
        await newService.save();
        res.json({status: statusText.SUCCESS, data: {service: newService} });    
});

const getService = asyncWrapper (async (req, res, next)=>{
    const serviceId = req.params.id; 

    const targetService = await Service.findById(serviceId)
        .populate('seller', 'firstName lastName email avatar');

    if (!targetService){
            const error = new appError("Service not found", 404, statusText.FAIL);
            return next(error);
        }
        res.json({status: statusText.SUCCESS, data: {targetService} });
});

const updateService = asyncWrapper (async (req, res, next)=>{

    const serviceId = req.params.id;

        const targetService = await Service.findById(serviceId);
        if (!targetService){
            const error = new appError("Service not found", 404, statusText.FAIL);
            return next(error);
        }

        if (targetService.seller.toString() === req.userData.id || req.userData.role === 'admin'){
            const updatedService = await Service.findByIdAndUpdate(
                serviceId, 
                {title, description, price, category},
                { new: true, runValidators: true }
            );
            return res.json({status: statusText.SUCCESS, data: {updatedService} });
        } else {
            const error = new appError("Not permitted", 403, statusText.FAIL);
            return next(error);
        }
});

const deleteService = asyncWrapper (async (req, res, next)=>{
    const serviceId = req.params.id; 
    
        const targetService = await Service.findById(serviceId);
        if (!targetService){
            const error = new appError("Service not found", 404, statusText.FAIL);
            return next(error);
        }

        if (targetService.seller.toString() === req.userData.id || req.userData.role === 'admin'){
            await Service.findByIdAndDelete(serviceId); 
            return res.json({status: statusText.SUCCESS, data: {targetService} });
        } else {
            const error = new appError("Not permitted", 403, statusText.FAIL);
            return next(error);
        }
    
});

module.exports = {
    createService,
    getServices,
    getService,
    updateService,
    deleteService
};