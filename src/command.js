import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {
    newNote,
    getAllNotes,
    findNotes,
    removeNote,
    removeAllNotes,
} from './notes.js';
import { start } from './server.js';

const listNotes = (notes) => {
    notes.forEach(({ id, content, tags }) => {
        console.log('note:', content);
        console.log('tags:', tags);
        console.log('id:', id);
        console.log('\n');
    });
};

// hideBin removes the first 2 instances of the process.argv array
// curl is the command and anything inside <> refers as a param
// options creates a flag ex. --tags or -t (alias)
// <> required / [] optional arguments

yargs(hideBin(process.argv))
    .command(
        'new <note>',
        'create a new note',
        (yargs) => {
            return yargs.positional('note', {
                describe: 'The content of the note you want to create',
                type: 'string',
            });
        },
        async (argv) => {
            const tags = argv.tags ? argv.tags.split(',') : [];
            const note = await newNote(argv.note, tags);
            console.log('New note!', note);
        }
    )
    .option('tags', {
        alias: 't',
        type: 'string',
        description: 'tags to add to the note',
    })
    .command(
        'all',
        'get all notes',
        () => {},
        async (argv) => {
            const notes = await getAllNotes();
            listNotes(notes);
        }
    )
    .command(
        'find <filter>',
        'get matching notes',
        (yargs) => {
            return yargs.positional('filter', {
                describe:
                    'The search term to filter notes by, will be applied to note.content',
                type: 'string',
            });
        },
        async (argv) => {
            const matches = await findNotes(argv.filter);
            listNotes(matches);
        }
    )
    .command(
        'remove <id>',
        'remove a note by id',
        (yargs) => {
            return yargs.positional('id', {
                type: 'number',
                description: 'The id of the note you want to remove',
            });
        },
        async (argv) => {
            const id = await removeNote(argv.id);
            console.log(id);
        }
    )
    .command(
        'web [port]',
        'launch website to see notes',
        (yargs) => {
            return yargs.positional('port', {
                describe: 'port to bind on',
                default: 5000,
                type: 'number',
            });
        },
        async (argv) => {
            const notes = await getAllNotes();
            start(notes, argv.port);
        }
    )
    .command(
        'clean',
        'remove all notes',
        () => {},
        async (argv) => {
            await removeAllNotes();
            console.log('db reset');
        }
    )
    .demandCommand(1)
    .parse();
