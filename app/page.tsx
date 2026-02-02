"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Shuffle, Trash2, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type ConversationCard = { id: string; text: string }
type Deck = { id: string; name: string; cards: ConversationCard[] }

export default function ConversationDeck() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [selectedDeckId, setSelectedDeckId] = useState<string>("")
  const [newDeckName, setNewDeckName] = useState("")
  const [newCardText, setNewCardText] = useState("")
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [direction, setDirection] = useState(0)
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

  const paginate = (newDirection: number) => {
    if (!selectedDeck?.cards || selectedDeck.cards.length === 0) return
    setDirection(newDirection)
    const nextIndex = (currentCardIndex + newDirection + selectedDeck.cards.length) % selectedDeck.cards.length
    setCurrentCardIndex(nextIndex)
  }

  const selectDeckAndPlay = (id: string) => {
    setSelectedDeckId(id)
    setCurrentCardIndex(0)
    setDirection(0)
    setActiveTab("play")
  }

  const addDeck = () => {
    if (!newDeckName) return
    const newDeck = { id: Date.now().toString(), name: newDeckName, cards: [] }
    setDecks([...decks, newDeck])
    setNewDeckName("")
    setSelectedDeckId(newDeck.id)
    setActiveTab("edit")
  }

  const addCard = () => {
    if (!newCardText || !selectedDeckId) return
    setDecks(decks.map(d => d.id === selectedDeckId ? { ...d, cards: [...d.cards, { id: Date.now().toString(), text: newCardText }] } : d))
    setNewCardText("")
  }

  return (
    <main className="min-h-[100dvh] bg-white text-zinc-900 px-4 py-2 font-sans antialiased tracking-tight">
      <div className="max-w-md mx-auto space-y-2">
        <header className="py-1 border-b border-zinc-100 flex flex-col items-center">
          <h1 className="text-lg font-bold tracking-[0.3em] uppercase">Dialogue Deck</h1>
          <p className="text-[9px] font-medium text-zinc-400 tracking-widest">会話デッキでトーク</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-4">
            <TabsList className="bg-zinc-100/50 p-1 rounded-xl h-11 w-full max-w-[320px]">
              {/* PLAYタブをクールな黒へ変更 */}
              <TabsTrigger value="play" className="w-full rounded-lg py-1.5 text-xs font-bold data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-zinc-400 transition-all uppercase">PLAY</TabsTrigger>
              <TabsTrigger value="select" className="w-full rounded-lg py-1.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-zinc-900 text-zinc-400 transition-all">選択</TabsTrigger>
              <TabsTrigger value="edit" className="w-full rounded-lg py-1.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-zinc-900 text-zinc-400 transition-all">編成</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="play" className="m-0 outline-none">
            {selectedDeck?.cards && selectedDeck.cards.length > 0 ? (
              <div className="relative min-h-[82dvh] py-8 bg-zinc-50 rounded-[40px] flex flex-col items-center justify-between border border-zinc-100 shadow-inner px-4">
                <div className="relative w-full aspect-[4/5] z-10">
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                      key={`${selectedDeckId}-${currentCardIndex}`}
                      custom={direction}
                      initial={{ opacity: 0, x: direction >= 0 ? 300 : -300 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: direction >= 0 ? -300 : 300 }}
                      transition={{ type: "spring", stiffness: 450, damping: 35 }} // 剛性を高めてシュパッと動作
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(_, info) => {
                        if (info.offset.x < -100) paginate(1)
                        else if (info.offset.x > 100) paginate(-1)
                      }}
                      onClick={() => paginate(1)} // タップでも次へ移動
                      className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    >
                      <Card className="w-full h-full bg-white border border-zinc-50 shadow-2xl rounded-[32px] flex flex-col items-center justify-center p-8">
                        <p className="text-4xl font-bold text-zinc-800 text-center leading-tight tracking-tighter select-none">
                          {selectedDeck.cards[currentCardIndex]?.text}
                        </p>
                      </Card>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="w-full flex gap-3 mt-6 z-10">
                  <Button onClick={() => {
                    const shuffled = [...selectedDeck.cards].sort(() => Math.random() - 0.5)
                    setDecks(decks.map(d => d.id === selectedDeckId ? { ...d, cards: shuffled } : d))
                    setCurrentCardIndex(0)
                  }} variant="outline" className="flex-1 border-zinc-200 text-zinc-400 bg-white hover:text-zinc-900 font-bold text-[9px] tracking-widest h-14 rounded-2xl">
                    <Shuffle className="mr-2" size={14}/> SHUFFLE
                  </Button>
                  <Button onClick={() => paginate(1)} className="flex-[2] bg-zinc-900 text-white hover:bg-zinc-800 h-14 rounded-2xl text-xs font-bold tracking-widest shadow-lg active:scale-95">
                    次のカードへ
                  </Button>
                </div>
              </div>
            ) : (
              <div className="min-h-[75vh] flex flex-col items-center justify-center bg-zinc-50 rounded-[40px] text-zinc-300 border border-dashed border-zinc-200 px-8 text-center">
                <span className="text-sm font-bold tracking-widest uppercase text-zinc-400">会話カードを登録してください</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="select" className="space-y-4 outline-none">
            <h3 className="text-[10px] font-bold text-zinc-300 tracking-[0.2em] uppercase px-1 text-center">使用するデッキを選択</h3>
            <div className="grid gap-3">
              {decks.map(d => (
                <button 
                  key={d.id} 
                  onClick={() => selectDeckAndPlay(d.id)}
                  className={`flex items-center justify-between p-6 rounded-[20px] border transition-all ${selectedDeckId === d.id ? "bg-zinc-900 border-zinc-900 text-white shadow-lg" : "bg-white border-zinc-100 text-zinc-600 shadow-sm"}`}
                >
                  <div className="flex flex-col items-start text-left">
                    <span className="font-bold text-base">{d.name}</span>
                    <span className={`text-[10px] mt-0.5 ${selectedDeckId === d.id ? "text-zinc-400" : "text-zinc-300"}`}>{d.cards.length} 枚</span>
                  </div>
                  <ChevronRight size={20} />
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="edit" className="space-y-8 outline-none px-1">
            <section className="space-y-3">
              <h3 className="text-[10px] font-bold text-zinc-300 tracking-[0.2em] uppercase">会話デッキを新規作成</h3>
              <div className="flex gap-2">
                <Input 
                  placeholder="新しい会話デッキ名..." 
                  value={newDeckName} 
                  onChange={(e) => setNewDeckName(e.target.value)} 
                  className="bg-zinc-50 border-none h-14 rounded-2xl shadow-inner text-base px-5" // text-baseでズーム防止
                />
                <Button onClick={addDeck} className="bg-zinc-900 text-white h-14 w-14 rounded-2xl shrink-0"><Plus size={24}/></Button>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-[10px] font-bold text-zinc-300 tracking-[0.2em] uppercase">カード編集：{selectedDeck?.name || "未選択"}</h3>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {decks.map(d => (
                  <button key={d.id} onClick={() => setSelectedDeckId(d.id)} className={`px-5 py-2.5 rounded-xl text-xs font-bold border whitespace-nowrap ${selectedDeckId === d.id ? "bg-zinc-100 border-zinc-200 text-zinc-900" : "bg-white border-zinc-100 text-zinc-300"}`}>
                    {d.name}
                  </button>
                ))}
              </div>

              {selectedDeck && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="会話カードを追加..." 
                      value={newCardText} 
                      onChange={(e) => setNewCardText(e.target.value)} 
                      className="bg-zinc-50 border-none h-14 rounded-2xl shadow-inner text-base px-5" // text-baseでズーム防止
                    />
                    <Button onClick={addCard} className="bg-zinc-100 text-zinc-900 h-14 w-14 rounded-2xl shrink-0"><Plus size={24}/></Button>
                  </div>
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedDeck?.cards?.map((c) => (
                      <div key={c.id} className="flex justify-between items-center p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                        <span className="text-sm text-zinc-600 font-bold">{c.text}</span>
                        <Button variant="ghost" size="sm" onClick={() => setDecks(decks.map(d => d.id === selectedDeckId ? { ...d, cards: d.cards.filter(card => card.id !== c.id) } : d))} className="text-zinc-300 hover:text-red-500"><Trash2 size={18}/></Button>
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