import express from 'express';
import { addSlide, deleteSlide, getSlides, updateSlide, uploadMiddleware } from '../controllers/slideController.js';

const router = express.Router();

// Route to get all slides
router.get('/', getSlides);

// Route to add a new slide with file upload
router.post('/add', uploadMiddleware, addSlide);

// Route to update a slide 
router.put('/:id', uploadMiddleware, updateSlide);

// Route to delete a slide 
router.delete('/:id', deleteSlide);

export default router;