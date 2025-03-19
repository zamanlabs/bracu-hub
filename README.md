# BRACU Hub

A modern chat application for BRAC University students to connect, collaborate, and communicate.

## Features

- Global chat for all BRACU students
- Direct messaging between students
- Profile customization
- Real-time updates
- Modern UI with responsive design

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase (Authentication & Database)
- Real-time subscriptions

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bracu-hub.git
cd bracu-hub
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is configured for deployment on GitHub Pages. The site is automatically deployed when changes are pushed to the main branch.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 