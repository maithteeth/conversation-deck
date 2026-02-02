"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Shuffle, Trash2, Layers, BookOpen, Copy, Check, ChevronRight } from "lucide-react"
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
  const [activeTab, setActiveTab] = useState("play")

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
    setActiveTab("edit") // 作成後は編成画面へ
  }

  const addCard = () => {
    if (!newCardText || !selectedDeckId) return
    setDecks(decks.map(d => d.id === selectedDeckId ? { ...d, cards: [...d.cards, { id: Date.now().toString(), text: newCardText }] } : d))
    setNewCardText("")
  }

  const selectDeckAndPlay = (id: string) => {
    setSelectedDeckId(id)
    setCurrentCardIndex(0)
    setCopied(false)
    setActiveTab("play") // 選択したらプレイ画面へ移動
  }

  return (
    <main className="min-h-[100dvh] bg-white text-zinc-900 p-4 font-sans antialiased tracking-tight">
      <div className="max-w-md mx-auto space-y-6">
        <header className="py-2 border-b border-zinc-100">
          <h1 className="text-base font-bold tracking-[0.3em] text-center uppercase text-zinc-900">Dialogue Deck</h1>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-zinc-100/50 p-1 rounded-xl mb-6 h-12">
            <TabsTrigger value="play" className="w-full rounded-lg py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-zinc-900 text-zinc-400 transition-all">PLAY</TabsTrigger>
            <TabsTrigger value="select" className="w-full rounded-lg py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-zinc-900 text-zinc-400 transition-all">選択</TabsTrigger>
            <TabsTrigger value="edit" className="w-full rounded-lg py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-zinc-900 text-zinc-400 transition-all">編成</TabsTrigger>
          </TabsList>

          <TabsContent value="play" className="m-0 outline-none">
            {selectedDeck && selectedDeck.cards.length > 0 ? (
              <div className="relative min-h-[75dvh] py-10 bg-zinc-50 rounded-[40px] flex flex-col items-center justify-between border border-zinc-100 shadow-inner px-6">
                <div className="absolute top-6 px-4 py-1 bg-white border border-zinc-200 rounded-full shadow-sm">
                  <span className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">{selectedDeck.name}</span>
                </div>

                <div className="relative w-full max-w-[280px] aspect-[3/4] z-10">
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                      key={currentCardIndex}
                      custom={direction}
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0, rotate: isFlipped ? 180 : 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ type: "spring", stiffness: 260, damping: 25 }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(_, info) => { if (info.offset.x < -100) nextCard() }}
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="absolute inset-0 cursor-pointer"
                    >
                      <Card className="w-full h-full bg-white border border-zinc-100 shadow-xl rounded-[32px] flex flex-col items-center justify-center p-10 relative">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => { e.stopPropagation(); copyToClipboard(); }}
                          className="absolute top-6 left-6 text-zinc-200 hover:text-zinc-900 z-10 hover:bg-zinc-50 rounded-full"
                        >
                          {copied ? <Check size={18} className="text-zinc-900" /> : <Copy size={18} />}
                        </Button>

                        <div className="absolute top-7 right-7 text-zinc-50"><Layers size={24}/></div>
                        <div className="absolute bottom-7 left-7 text-zinc-50"><BookOpen size={24}/></div>
                        
                        <p className="text-xl font-bold text-zinc-800 text-center leading-relaxed tracking-tight">
                          {selectedDeck.cards[currentCardIndex].text}
                        </p>
                      </Card>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="w-full flex gap-3 mt-10 z-10">
                  <Button onClick={() => {
                    const shuffled = [...selectedDeck.cards].sort(() => Math.random() - 0.5)
                    setDecks(decks.map(d => d.id === selectedDeckId ? { ...d, cards: shuffled } : d))
                    setCurrentCardIndex(0)
                  }} variant="outline" className="flex-1 border-zinc-200 text-zinc-400 bg-white hover:text-zinc-900 font-bold text-[10px] tracking-widest h-14 rounded-2xl transition-all">
                    <Shuffle className="mr-2" size={14}/> SHUFFLE
                  </Button>
                  <Button onClick={nextCard} className="flex-[2] bg-zinc-900 text-white hover:bg-zinc-800 h-14 rounded-2xl text-xs font-bold tracking-widest shadow-lg transition-all active:scale-95">
                    次のカードへ
                  </Button>
                </div>
              </div>
            ) : (
              <div className="min-h-[70vh] flex flex-col items-center justify-center bg-zinc-50 rounded-[40px] text-zinc-300 border border-dashed border-zinc-200 gap-4">
                <BookOpen size={32} strokeWidth={1} />
                <span className="text-xs font-bold tracking-widest uppercase">デッキまたはカードを登録してください</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="select" className="space-y-4 outline-none">
            <h3 className="text-[10px] font-bold text-zinc-300 tracking-[0.2em] uppercase px-1">使用するデッキを選択</h3>
            <div className="grid gap-3">
              {decks.map(d => (
                <button 
                  key={d.id} 
                  onClick={() => selectDeckAndPlay(d.id)}
                  className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${selectedDeckId === d.id ? "bg-zinc-900 border-zinc-900 text-white shadow-lg" : "bg-white border-zinc-100 text-zinc-600 hover:border-zinc-300"}`}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-sm">{d.name}</span>
                    <span className={`text-[10px] ${selectedDeckId === d.id ? "text-zinc-400" : "text-zinc-300"}`}>{d.cards.length} 枚のカード</span>
                  </div>
                  <ChevronRight size={18} opacity={selectedDeckId === d.id ? 1 : 0.3} />
                </button>
              ))}
              {decks.length === 0 && (
                <p className="text-center py-20 text-zinc-300 text-xs italic">デッキがありません</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="edit" className="space-y-10 outline-none">
            <section className="space-y-4 px-1">
              <h3 className="text-[10px] font-bold text-zinc-300 tracking-[0.2em] uppercase">デッキを新規作成</h3>
              <div className="flex gap-2">
                <Input placeholder="新しいデッキ名..." value={newDeckName} onChange={(e) => setNewDeckName(e.target.value)} className="bg-zinc-50 border-none h-14 rounded-2xl focus:ring-zinc-900 shadow-inner" />
                <Button onClick={addDeck} className="bg-zinc-900 hover:bg-zinc-800 text-white h-14 w-14 rounded-2xl shrink-0 shadow-lg shadow-zinc-200"><Plus size={24}/></Button>
              </div>
            </section>

            <section className="space-y-6 px-1">
              <h3 className="text-[10px] font-bold text-zinc-300 tracking-[0.2em] uppercase">カードの編集</h3>
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {decks.map(d => (
                  <button 
                    key={d.id} 
                    onClick={() => setSelectedDeckId(d.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${selectedDeckId === d.id ? "bg-zinc-100 border-zinc-200 text-zinc-900" : "bg-white border-zinc-100 text-zinc-300 hover:border-zinc-200"}`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>

              {selectedDeck && (
                <div className="space-y-4 pt-2">
                  <div className="flex gap-2">
                    <Input placeholder="会話カードを追加..." value={newCardText} onChange={(e) => setNewCardText(e.target.value)} className="bg-zinc-50 border-none h-14 rounded-2xl shadow-inner" />
                    <Button onClick={addCard} className="bg-zinc-200 text-zinc-900 hover:bg-zinc-300 h-14 w-14 rounded-2xl shrink-0"><Plus size={24}/></Button>
                  </div>
                  <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedDeck.cards.map((c) => (
                      <div key={c.id} className="flex justify-between items-center p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                        <span className="text-sm text-zinc-600 font-medium">{c.text}</span>
                        <Button variant="ghost" size="sm" onClick={() => setDecks(decks.map(d => d.id === selectedDeckId ? { ...d, cards: d.cards.filter(card => card.id !== c.id) } : d))} className="text-zinc-300 hover:text-red-500 hover:bg-transparent">
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