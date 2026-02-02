"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Shuffle, Trash2, Layers, BookOpen, Copy, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type ConversationCard = { id: string; text: string }
type Deck = { id: string; name: string; cards: ConversationCard[] }

export default function ConversationDeck() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [selectedDeckId, setSelectedDeckId] = useState<string>("")
  const [newDeckName, setNewDeckName] = useState("")
  const [newCardText, setNewCardText] = useState("")
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [direction, setDirection] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("conv-decks")
    if (saved) {
      const parsed = JSON.parse(saved)
      setDecks(parsed)
      if (parsed.length > 0) setSelectedDeckId(parsed[0].id)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("conv-decks", JSON.stringify(decks))
  }, [decks])

  const selectedDeck = decks.find(d => d.id === selectedDeckId)

  const nextCard = () => {
    if (!selectedDeck || selectedDeck.cards.length === 0) return
    setDirection(1)
    setCurrentCardIndex((prev) => (prev + 1) % selectedDeck.cards.length)
    setIsFlipped(false)
    setCopied(false)
  }

  const copyToClipboard = () => {
    if (selectedDeck && selectedDeck.cards[currentCardIndex]) {
      navigator.clipboard.writeText(selectedDeck.cards[currentCardIndex].text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const addDeck = () => {
    if (!newDeckName) return
    const newDeck = { id: Date.now().toString(), name: newDeckName, cards: [] }
    setDecks([...decks, newDeck])
    setNewDeckName("")
    setSelectedDeckId(newDeck.id)
  }

  const addCard = () => {
    if (!newCardText || !selectedDeckId) return
    setDecks(decks.map(d => d.id === selectedDeckId ? { ...d, cards: [...d.cards, { id: Date.now().toString(), text: newCardText }] } : d))
    setNewCardText("")
  }

  return (
    <main className="min-h-[100dvh] bg-stone-50 text-zinc-800 p-6 font-sans antialiased tracking-tight">
      <div className="max-w-md mx-auto space-y-8">
        <header className="py-2 border-b border-stone-200">
          <h1 className="text-lg font-bold tracking-[0.2em] text-center uppercase text-zinc-900">Dialogue Deck</h1>
        </header>

        <Tabs defaultValue="play" className="w-full">
          <TabsList className="bg-stone-200/50 p-1 rounded-xl mb-8">
            <TabsTrigger value="play" className="w-full rounded-lg py-2 font-bold data-[state=active]:bg-white data-[state=active]:text-zinc-900 text-zinc-400 transition-all">PLAY</TabsTrigger>
            <TabsTrigger value="edit" className="w-full rounded-lg py-2 font-bold data-[state=active]:bg-white data-[state=active]:text-zinc-900 text-zinc-400 transition-all">デッキ編成</TabsTrigger>
          </TabsList>

          <TabsContent value="play" className="m-0 outline-none">
            <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide px-1">
              {decks.map(d => (
                <button 
                  key={d.id} 
                  onClick={() => {setSelectedDeckId(d.id); setCurrentCardIndex(0); setCopied(false);}}
                  className={`px-5 py-2 text-xs font-bold transition-all border rounded-full whitespace-nowrap ${selectedDeckId === d.id ? "bg-zinc-900 text-white border-zinc-900 shadow-md" : "bg-white text-zinc-400 border-stone-200 hover:border-stone-300"}`}
                >
                  {d.name}
                </button>
              ))}
            </div>

            {selectedDeck && selectedDeck.cards.length > 0 ? (
              <div className="relative h-[60vh] bg-stone-100 rounded-[40px] flex flex-col items-center justify-center border border-stone-200 shadow-inner px-6">
                <div className="relative w-full max-w-[280px] aspect-[3/4] z-10">
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                      key={currentCardIndex}
                      custom={direction}
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0, rotate: isFlipped ? 180 : 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      transition={{ type: "spring", stiffness: 260, damping: 25 }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(_, info) => { if (info.offset.x < -100) nextCard() }}
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="absolute inset-0 cursor-pointer"
                    >
                      <Card className="w-full h-full bg-white border border-stone-100 shadow-xl rounded-[32px] flex flex-col items-center justify-center p-10 relative">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => { e.stopPropagation(); copyToClipboard(); }}
                          className="absolute top-6 left-6 text-stone-300 hover:text-zinc-900 z-10 hover:bg-stone-50 rounded-full"
                        >
                          {copied ? <Check size={18} className="text-zinc-900" /> : <Copy size={18} />}
                        </Button>

                        <div className="absolute top-7 right-7 text-stone-100"><Layers size={24}/></div>
                        <div className="absolute bottom-7 left-7 text-stone-100"><BookOpen size={24}/></div>
                        
                        <p className="text-xl font-bold text-zinc-800 text-center leading-relaxed tracking-tight">
                          {selectedDeck.cards[currentCardIndex].text}
                        </p>
                      </Card>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="w-full flex gap-3 mt-12 z-10">
                  <Button onClick={() => {
                    const shuffled = [...selectedDeck.cards].sort(() => Math.random() - 0.5)
                    setDecks(decks.map(d => d.id === selectedDeckId ? { ...d, cards: shuffled } : d))
                    setCurrentCardIndex(0)
                  }} variant="outline" className="flex-1 border-stone-300 text-stone-400 hover:bg-white hover:text-zinc-900 font-bold text-[10px] tracking-widest h-12 rounded-2xl transition-all">
                    <Shuffle className="mr-2" size={14}/> SHUFFLE
                  </Button>
                  <Button onClick={nextCard} className="flex-[2] bg-zinc-900 text-white hover:bg-zinc-800 h-12 rounded-2xl text-xs font-bold tracking-widest shadow-lg transition-all active:scale-95">
                    次のカードへ
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-[50vh] flex flex-col items-center justify-center bg-stone-100/50 rounded-[40px] text-stone-300 border border-dashed border-stone-200">
                <span className="text-xs font-bold tracking-widest uppercase">カードを登録してください</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="edit" className="space-y-10">
            <section className="space-y-4 px-1">
              <h3 className="text-[10px] font-bold text-zinc-400 tracking-[0.2em] uppercase">デッキ作成</h3>
              <div className="flex gap-2">
                <Input placeholder="新しいデッキ名..." value={newDeckName} onChange={(e) => setNewDeckName(e.target.value)} className="bg-white border-stone-200 h-12 rounded-xl focus:ring-zinc-900" />
                <Button onClick={addDeck} className="bg-zinc-900 hover:bg-zinc-800 text-white h-12 w-12 rounded-xl shrink-0"><Plus size={24}/></Button>
              </div>
            </section>

            <section className="space-y-6 px-1">
              <h3 className="text-[10px] font-bold text-zinc-400 tracking-[0.2em] uppercase">カード管理</h3>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {decks.map(d => (
                  <button 
                    key={d.id} 
                    onClick={() => setSelectedDeckId(d.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${selectedDeckId === d.id ? "bg-zinc-100 border-zinc-200 text-zinc-900" : "bg-white border-stone-100 text-stone-300 hover:border-stone-200"}`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>

              {selectedDeck && (
                <div className="space-y-4 pt-2">
                  <div className="flex gap-2">
                    <Input placeholder="会話カードを追加..." value={newCardText} onChange={(e) => setNewCardText(e.target.value)} className="bg-white border-stone-200 h-12 rounded-xl" />
                    <Button onClick={addCard} className="bg-stone-200 text-zinc-900 hover:bg-stone-300 h-12 w-12 rounded-xl shrink-0"><Plus size={24}/></Button>
                  </div>
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedDeck.cards.map((c) => (
                      <div key={c.id} className="flex justify-between items-center p-4 bg-white rounded-xl border border-stone-100 shadow-sm">
                        <span className="text-sm text-zinc-600 font-medium">{c.text}</span>
                        <Button variant="ghost" size="sm" onClick={() => setDecks(decks.map(d => d.id === selectedDeckId ? { ...d, cards: d.cards.filter(card => card.id !== c.id) } : d))} className="text-stone-300 hover:text-red-500 hover:bg-transparent">
                          <Trash2 size={16}/>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}