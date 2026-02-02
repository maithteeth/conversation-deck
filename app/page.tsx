"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Shuffle, Trash2, Layers, BookOpen, Copy, Check, Diamond } from "lucide-react"
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
    // 全体の背景を明るく上品なストーン調に変更
    <main className="min-h-[100dvh] bg-stone-100 text-stone-800 p-4 font-serif overflow-hidden">
      <div className="max-w-md mx-auto space-y-4">
        <header className="py-3 border-b border-stone-300">
          {/* タイトル色を落ち着いたインディゴに。フォントもセリフ体で優雅に */}
          <h1 className="text-2xl font-bold tracking-wider text-indigo-900 text-center">
            <Diamond className="inline-block mr-2 h-5 w-5 text-amber-600" />
            Dialogue Deck
            <Diamond className="inline-block ml-2 h-5 w-5 text-amber-600" />
          </h1>
        </header>

        <Tabs defaultValue="play" className="w-full">
          {/* タブの配色を上品なグレージュとインディゴに変更 */}
          <TabsList className="grid w-full grid-cols-2 bg-stone-200 border border-stone-300 rounded-xl mb-4 shadow-sm">
            <TabsTrigger value="play" className="data-[state=active]:bg-indigo-700 data-[state=active]:text-white font-semibold tracking-wider transition-all">PLAY</TabsTrigger>
            <TabsTrigger value="edit" className="data-[state=active]:bg-indigo-700 data-[state=active]:text-white font-semibold tracking-wider transition-all">デッキ編成</TabsTrigger>
          </TabsList>

          <TabsContent value="play" className="mt-2 outline-none">
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide px-1">
              {decks.map(d => (
                <button 
                  key={d.id} 
                  onClick={() => {setSelectedDeckId(d.id); setCurrentCardIndex(0); setCopied(false);}}
                  // デッキ選択ボタンの配色を変更
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex-shrink-0 border shadow-sm ${selectedDeckId === d.id ? "bg-indigo-700 border-indigo-800 text-white shadow-md" : "bg-white border-stone-300 text-stone-600 hover:bg-stone-50"}`}
                >
                  {d.name}
                </button>
              ))}
            </div>

            {selectedDeck && selectedDeck.cards.length > 0 ? (
              // カード表示エリアの背景に「木目調のテーブル」を表現するグラデーションとシャドウを適用
              <div className="relative h-[65vh] flex flex-col items-center justify-between mt-4 p-6 rounded-3xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900 via-yellow-950 to-stone-950 shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] border-b-4 border-stone-900">
                <div className="relative w-full aspect-[2.5/3.5] max-w-[300px] z-10">
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                      key={currentCardIndex}
                      custom={direction}
                      initial={{ x: 400, opacity: 0, rotate: 5, scale: 0.9 }}
                      animate={{ x: 0, opacity: 1, rotate: isFlipped ? 180 : 0, scale: 1 }}
                      exit={{ x: -400, opacity: 0, rotate: -5, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 200, damping: 25 }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(_, info) => { if (info.offset.x < -100) nextCard() }}
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="absolute inset-0 cursor-pointer perspective-1000"
                    >
                      {/* カード自体のデザイン変更 */}
                      <Card className="w-full h-full bg-stone-50 border-2 border-stone-300 shadow-[0_8px_30px_rgba(0,0,0,0.3)] rounded-2xl flex flex-col items-center justify-center p-8 relative overflow-hidden">
                        {/* 装飾フレームの色をアンティークゴールドに変更 */}
                        <div className="absolute inset-3 border-2 border-amber-700/30 pointer-events-none rounded-xl" />
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => { e.stopPropagation(); copyToClipboard(); }}
                          className="absolute top-4 left-4 text-stone-500 hover:text-indigo-600 z-10 hover:bg-stone-100"
                        >
                          {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
                        </Button>

                        {/* アイコン色を変更 */}
                        <div className="absolute top-5 right-5 text-amber-700 opacity-70"><Layers size={24}/></div>
                        <div className="absolute bottom-5 left-5 text-amber-700 opacity-70"><BookOpen size={24}/></div>
                        
                        {/* テキスト色を変更 */}
                        <p className="text-2xl font-bold text-stone-900 text-center leading-relaxed tracking-tight font-serif">
                          {selectedDeck.cards[currentCardIndex].text}
                        </p>
                      </Card>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="w-full flex gap-4 mt-8 z-10">
                  {/* ボタンのデザイン変更 */}
                  <Button onClick={() => {
                    const shuffled = [...selectedDeck.cards].sort(() => Math.random() - 0.5)
                    setDecks(decks.map(d => d.id === selectedDeckId ? { ...d, cards: shuffled } : d))
                    setCurrentCardIndex(0)
                    setCopied(false)
                  }} variant="outline" className="flex-1 border-stone-400 bg-white/10 text-stone-300 hover:bg-white/20 hover:text-white font-bold uppercase tracking-wider backdrop-blur-sm transition-all">
                    <Shuffle className="mr-2" size={18}/> Shuffle
                  </Button>
                  <Button onClick={nextCard} className="flex-[2] bg-indigo-600 hover:bg-indigo-500 py-6 text-xl font-bold text-white shadow-lg shadow-indigo-900/50 border-b-4 border-indigo-800 transition-all active:border-b-0 active:translate-y-1">
                    NEXT CARD
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-[50vh] flex items-center justify-center border-2 border-dashed border-stone-300 bg-white/50 rounded-3xl text-stone-500 italic font-serif">
                デッキを編成してください
              </div>
            )}
          </TabsContent>

          <TabsContent value="edit" className="space-y-6">
            {/* 編集エリアのデザイン変更 */}
            <section className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-indigo-700 tracking-widest uppercase flex items-center"><Diamond size={12} className="mr-1"/>New Deck</h3>
              <div className="flex gap-2">
                <Input placeholder="新しいデッキ名..." value={newDeckName} onChange={(e) => setNewDeckName(e.target.value)} className="bg-stone-50 border-stone-300 focus:border-indigo-500 text-stone-800" />
                <Button onClick={addDeck} className="bg-indigo-700 hover:bg-indigo-600 shrink-0 px-5 shadow-sm"><Plus size={20}/></Button>
              </div>
            </section>

            <section className="space-y-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-stone-500 tracking-widest uppercase flex items-center"><Layers size={12} className="mr-1"/>Target Deck</h3>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-stone-300">
                {decks.map(d => (
                  <button 
                    key={d.id} 
                    onClick={() => {setSelectedDeckId(d.id); setCopied(false);}}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${selectedDeckId === d.id ? "bg-indigo-100 border-indigo-500 text-indigo-800" : "bg-stone-50 border-stone-300 text-stone-600 hover:bg-stone-100"}`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>

              {selectedDeck && (
                <div className="space-y-4 pt-2">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="会話カードを追加..." 
                      value={newCardText} 
                      onChange={(e) => setNewCardText(e.target.value)} 
                      className="bg-stone-50 border-stone-300 focus:border-indigo-500 text-stone-800" 
                    />
                    <Button onClick={addCard} className="bg-stone-700 hover:bg-indigo-600 text-white shadow-sm"><Plus size={20}/></Button>
                  </div>
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedDeck.cards.map((c) => (
                      <div key={c.id} className="flex justify-between items-center p-4 bg-stone-50 rounded-xl border border-stone-200 group hover:border-indigo-300 transition-colors shadow-sm">
                        <span className="text-sm text-stone-700 font-medium">{c.text}</span>
                        <Button variant="ghost" size="sm" onClick={() => setDecks(decks.map(d => d.id === selectedDeckId ? { ...d, cards: d.cards.filter(card => card.id !== c.id) } : d))} className="text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all">
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