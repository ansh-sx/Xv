'use client'

import { useState, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { Search, Moon, Sun, Volume2, Loader2, BookOpen, Lightbulb, ExternalLink, Clock, Star, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Toast } from '@/components/ui/toast'
import { motion, AnimatePresence } from 'framer-motion'

interface WordData {
  word: string
  phonetic: string
  phonetics: { text: string; audio: string }[]
  meanings: {
    partOfSpeech: string
    definitions: {
      definition: string
      example?: string
      synonyms: string[]
      antonyms: string[]
    }[]
  }[]
  sourceUrls: string[]
}

const commonWords = [
  'apple', 'banana', 'cat', 'dog', 'elephant', 'frog', 'giraffe', 'house', 'igloo', 'jacket',
  'kangaroo', 'lemon', 'monkey', 'notebook', 'orange', 'penguin', 'quilt', 'rabbit', 'sun', 'tree',
  'umbrella', 'violin', 'water', 'xylophone', 'yellow', 'zebra'
]

export default function UltimateDictionaryApp() {
  const [searchTerm, setSearchTerm] = useState('')
  const [wordData, setWordData] = useState<WordData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [wordOfTheDay, setWordOfTheDay] = useState<WordData | null>(null)
  const [favoriteWords, setFavoriteWords] = useState<string[]>([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const { theme, setTheme } = useTheme()

  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchWordOfTheDay()
    const storedRecentSearches = localStorage.getItem('recentSearches')
    if (storedRecentSearches) {
      setRecentSearches(JSON.parse(storedRecentSearches))
    }
    const storedFavoriteWords = localStorage.getItem('favoriteWords')
    if (storedFavoriteWords) {
      setFavoriteWords(JSON.parse(storedFavoriteWords))
    }
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length > 1) {
        const filteredSuggestions = commonWords.filter(word =>
          word.toLowerCase().startsWith(searchTerm.toLowerCase())
        )
        setSuggestions(filteredSuggestions)
        setOpen(filteredSuggestions.length > 0)
      } else {
        setSuggestions([])
        setOpen(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  const fetchWordOfTheDay = async () => {
    const randomWords = ['serendipity', 'ephemeral', 'eloquent', 'resilient', 'mellifluous']
    const randomWord = randomWords[Math.floor(Math.random() * randomWords.length)]
    await fetchWordData(randomWord, true)
  }

  const fetchWordData = async (word: string, isWordOfTheDay = false) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      if (!response.ok) {
        throw new Error('Word not found')
      }
      const data = await response.json()
      if (isWordOfTheDay) {
        setWordOfTheDay(data[0])
      } else {
        setWordData(data[0])
        updateRecentSearches(word)
      }
    } catch (err) {
      setError(err.message)
      if (!isWordOfTheDay) {
        setWordData(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const updateRecentSearches = (word: string) => {
    setRecentSearches(prevSearches => {
      const updatedSearches = [word, ...prevSearches.filter(w => w !== word)].slice(0, 5)
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches))
      return updatedSearches
    })
  }

  const playAudio = (audioUrl: string) => {
    new Audio(audioUrl).play()
  }

  const handleSearch = (word: string) => {
    setSearchTerm(word)
    fetchWordData(word)
    setOpen(false)
  }

  const toggleFavorite = (word: string) => {
    setFavoriteWords(prevFavorites => {
      let updatedFavorites
      if (prevFavorites.includes(word)) {
        updatedFavorites = prevFavorites.filter(w => w !== word)
        setToastMessage(`Removed "${word}" from favorites`)
      } else {
        updatedFavorites = [...prevFavorites, word]
        setToastMessage(`Added "${word}" to favorites`)
      }
      localStorage.setItem('favoriteWords', JSON.stringify(updatedFavorites))
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      return updatedFavorites
    })
  }

  const renderWordCard = (data: WordData | null, isWordOfTheDay = false) => {
    if (!data) return null

    return (
      <Card className="overflow-hidden shadow-xl">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardTitle className="text-4xl font-bold mb-2 flex items-center justify-between">
            {data.word}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFavorite(data.word)}
              className="text-white hover:text-pink-200"
            >
              <Heart className={`h-6 w-6 ${favoriteWords.includes(data.word) ? 'fill-current' : ''}`} />
            </Button>
          </CardTitle>
          <CardDescription className="text-2xl flex items-center text-indigo-100">
            {data.phonetic}
            {data.phonetics[0]?.audio && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 text-white hover:text-indigo-200"
                onClick={() => playAudio(data.phonetics[0].audio)}
              >
                <Volume2 className="h-6 w-6" />
              </Button>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue={data.meanings[0].partOfSpeech}>
            <TabsList className="mb-4 bg-indigo-100 dark:bg-indigo-900/20 p-1 rounded-full">
              {data.meanings.map((meaning, index) => (
                <TabsTrigger 
                  key={index} 
                  value={meaning.partOfSpeech}
                  className="rounded-full px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-indigo-600 dark:data-[state=active]:text-white"
                >
                  {meaning.partOfSpeech}
                </TabsTrigger>
              ))}
            </TabsList>
            {data.meanings.map((meaning, index) => (
              <TabsContent key={index} value={meaning.partOfSpeech}>
                <h3 className="text-3xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">
                  {meaning.partOfSpeech}
                </h3>
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <ol className="space-y-6">
                    {meaning.definitions.map((def, defIndex) => (
                      <li key={defIndex} className="mb-4">
                        <p className="text-xl font-medium mb-2">{def.definition}</p>
                        {def.example && (
                          <p className="text-lg text-gray-600 dark:text-gray-300 italic mb-2">"{def.example}"</p>
                        )}
                        {(def.synonyms.length > 0 || def.antonyms.length > 0) && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {def.synonyms.length > 0 && (
                              <div>
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Synonyms: </span>
                                {def.synonyms.map((syn, synIndex) => (
                                  <Badge key={synIndex} variant="secondary" className="mr-1 mb-1">
                                    {syn}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {def.antonyms.length > 0 && (
                              <div>
                                <span className="font-semibold text-purple-600 dark:text-purple-400">Antonyms: </span>
                                {def.antonyms.map((ant, antIndex) => (
                                  <Badge key={antIndex} variant="outline" className="mr-1 mb-1">
                                    {ant}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        {defIndex < meaning.definitions.length - 1 && <Separator className="my-4" />}
                      </li>
                    ))}
                  </ol>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
          {data.sourceUrls.length > 0 && (
            <div className="mt-8 border-t pt-4">
              <h3 className="text-2xl font-semibold mb-2 flex items-center text-indigo-600 dark:text-indigo-400">
                <BookOpen className="mr-2 h-6 w-6" />
                Sources
              </h3>
              <ul className="space-y-2">
                {data.sourceUrls.map((url, index) => (
                  <li key={index} className="flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2 text-indigo-500" />
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary flex items-center">
            <BookOpen className="mr-2 h-8 w-8" />
            Ultimate Dictionary
          </h1>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative mb-8"
        >
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div className="flex gap-2">
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for a word..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
                  className="w-full text-lg py-6 px-4 rounded-2xl resize-none border border-neutral-400 shadow-sm pr-16"
                />
                <Button 
                  onClick={() => handleSearch(searchTerm)} 
                  disabled={isLoading}
                  className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-6"
                >
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Search className="h-6 w-6" />}
                </Button>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput 
                  placeholder="Search for a word..." 
                  value={searchTerm} 
                  onValueChange={setSearchTerm}
                />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Suggestions">
                    {suggestions.map((suggestion) => (
                      <CommandItem
                        key={suggestion}
                        onSelect={() => handleSearch(suggestion)}
                        className="cursor-pointer"
                      >
                        {suggestion}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </motion.div>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-8 border-red-500">
                <CardContent className="pt-6">
                  <p className="text-red-500 flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5" />
                    {error}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {wordData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {renderWordCard(wordData)}
            </motion.div>
          )}
        </AnimatePresence>
        {!wordData && wordOfTheDay && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center text-indigo-600 dark:text-indigo-400">
              <Star className="mr-2 h-6 w-6 text-yellow-500" />
              Word of the Day
            </h2>
            {renderWordCard(wordOfTheDay, true)}
          </div>
        )}
        {recentSearches.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center text-indigo-600 dark:text-indigo-400">
              <Clock className="mr-2 h-6 w-6" />
              Recent Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((word, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleSearch(word)}
                  className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  {word}
                </Button>
              ))}
            </div>
          </div>
        )}
        {favoriteWords.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center text-indigo-600 dark:text-indigo-400">
              <Heart className="mr-2 h-6 w-6 text-pink-500" />
              Favorite Words
            </h2>
            <div className="flex flex-wrap gap-2">
              {favoriteWords.map((word, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleSearch(word)}
                  className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300"
                >
                  {word}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4"
          >
            <Toast>
              <p className="text-sm font-medium">{toastMessage}</p>
            </Toast>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
  }
