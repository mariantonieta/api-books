import { Router, Request, Response } from "express";
import { db } from "../db/firebase/admin";

const router = Router()

interface Book {
    id?: string;
    description: string;
    author: string;
    name: string;
}

/**
 * Retrieve a list of books with optional ordering and limiting.
 *
 * @route GET /books
 * @param {object} [options] - Optional parameters for ordering and limiting the result.
 * @param {string} [options.orderBy='name'] - The field by which to order the books (default is 'name').
 * @param {number} [options.limit=20] - The maximum number of books to retrieve (default is 20).
 * @returns {Promise<Array<object>>} Returns an array of JSON objects representing the books.
 * @throws {500} If there's an issue with the server.
 *
 * @example
 * GET /books
 */
router.get('/', async (req: Request, res: Response) => {
    const snapshot = await db.collection('Books').orderBy('name').limit(20).get();
    const books: Book[] = [];

    snapshot.forEach((doc: any) => {
        books.push({ id: doc.id, ...doc.data() } as Book);
    });

    res.json(books);
});

/**
 * Retrieve information about a book by providing its unique identifier.
 *
 * @route GET /books/:id
 * @param {String} id - The unique identifier of the book.
 * @returns {Promise<object>} Returns a JSON object representing the book.
 * @throws {404} If the provided book ID does not exist.
 *
 * @example
 * GET /books/123
 */
router.get('/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    const doc = await db.collection('Books').doc(id).get();

    if (!doc.exists) {
        return res.status(404).json({ message: 'Book not found' });
    }

    const book = { id: doc.id, ...doc.data() } as Book;
    res.json(book);
});

/**
 * Add a new book to the database.
 *
 * @route POST /books
 * @param {object} newBook - A JSON object representing the new book.
 * @returns {Promise<object>} Returns a JSON object representing the newly created book.
 * @throws {500} If there's an issue with the server.
 *
 * @example
 * POST /books
 * Content-Type: application/json
 * {
 *   "name": "The Art of Programming",
 *   "author": "John Doe",
 *   "description": "Programming"
 * }
 */
router.post('/', async (req: Request, res: Response) => {
    const newBook: Book = req.body;

    const docRef = await db.collection('Books').add(newBook);
    const book = { id: docRef.id, ...newBook } as Book;

    res.status(201).json(book);
});

/**
 * Update the information of a book by providing its unique identifier.
 *
 * @route PUT /books/:id
 * @param {String} id - The unique identifier of the book to be updated.
 * @param {object} newData - A JSON object containing the new data for the book.
 * @returns {Promise<object>} Returns a JSON object with a success message.
 * @throws {404} If the provided book ID does not exist.
 * @throws {500} If there's an issue with the server.
 *
 * @example
 * PUT /books/123
 * Content-Type: application/json
 * {
 *   "name": "Updated Title",
 *   "author": "Updated Author",
 *   "description": "Pepe"
 * }
 */
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const newData = req.body; // Los nuevos datos del libro proporcionados en el cuerpo de la solicitud

        // Verifica si el libro existe antes de intentar actualizar
        const doc = await db.collection('Books').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Actualiza los datos del libro en Firestore
        await db.collection('Books').doc(id).update(newData);

        res.json({ message: 'Book updated successfully' });
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * Remove a book from the database by providing its unique identifier.
 *
 * @route DELETE /books/:id
 * @param {String} id - The unique identifier of the book to be deleted.
 * @returns {Promise<object>} Returns a JSON object with a success message.
 * @throws {404} If the provided book ID does not exist.
 * @throws {500} If there's an issue with the server.
 *
 * @example
 * DELETE /books/123
 */
router.delete('/:id', async (req: Request, res: Response) => {

    try {
        const id = req.params.id;

        const doc = await db.collection('Books').doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Book not found' });
        }

        await db.collection('Books').doc(id).delete();

        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

});

export { router };