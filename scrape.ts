import { writeToPath } from "@fast-csv/format";
import { writeFileSync } from "fs";

interface Book {
    id: number;
    title: string;
    author: string;
    publisher: string;
    genre: string;
    isbnNo: string;
    pages: number;
    totalCopies: number;
    availableCopies: number;
}

async function searchTopic(search: string): Promise<Book[]> {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${search}&maxResults=40`;
    console.log(url);
    const response = await fetch(url);
    const data = (await response.json()) as any;
    return data.items
        .map((item: any, index: number) => {
            const copies = Math.floor(Math.random() * 10) + 2;
            try {
                const book: Book = {
                    id: index + 1,
                    title: item.volumeInfo.title,
                    author: item.volumeInfo.authors.join(", "),
                    publisher: item.volumeInfo.publisher,
                    genre: item.volumeInfo.categories[0],
                    isbnNo: item.volumeInfo.industryIdentifiers.find(
                        (idf: any) => idf.type === "ISBN_13"
                    )?.identifier,
                    pages: item.volumeInfo.pageCount || 0,
                    totalCopies: copies,
                    availableCopies: copies,
                };
                if (!book.isbnNo) {
                    item.volumeInfo.industryIdentifiers[0].identifier;
                }
                return book;
            } catch (err) {
                return null;
            }
        })
        .filter((b: any) => b);
}

async function scrapeBooks(...searches: string[]) {
    const books: Book[] = [];
    const isbns: string[] = [];
    for await (const topic of searches) {
        const fetchedBooks = await searchTopic(topic);
        fetchedBooks.forEach((book) => {
            if (isbns.indexOf(book.isbnNo) === -1) {
                isbns.push(book.isbnNo);
                book.id = isbns.length;
                books.push(book);
            }
        });
    }

    writeToPath(`scraped/books_${Date.now()}.csv`, books, {
        headers: true,
    });

    writeFileSync(
        `scraped/books_${Date.now()}.json`,
        JSON.stringify(books, null, 4)
    );
}

scrapeBooks(
    "programming",
    "history",
    'inauthor:"robin+sharma"',
    'inauthor:"salman+rushdie"',
    "angels+and+demon"
);
