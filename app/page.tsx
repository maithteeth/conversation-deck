"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RotateCcw, Shuffle } from "lucide-react" // 標準的なアイコンですわ

type Deck = { id: string; name: string; cards: string[] }

export default function Home() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [currentDeckId, setCurrentDeckId] = useState<string>("")
  const [newCardText, setNewCardText] = useState("")
  const [newDeckName, setNewDeckName] = useState("")
  const [displayIndex, setDisplayIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false) // 反転の記憶

  useEffect(() => {
    const saved = localStorage.getItem("conv-decks")
    if (saved) {
      const parsed = JSON.parse(saved)
      setDecks(parsed)
      if (parsed.length > 0) setCurrentDeckId(parsed[0].id)
    }
  }, [])

  useEffect(() => {
    if (decks.length > 0) localStorage.setItem("conv-decks", JSON.stringify(decks))
  }, [decks])

  const currentDeck = decks.find(d => d.id === currentDeckId)

  const addDeck = () => {
    if (!newDeckName) return
    const newDeck = { id: Date.now().toString(), name: newDeckName, cards: [] }
    setDecks([...decks, newDeck])
    setNewDeckName("")
    setCurrentDeckId(newDeck.id)
  }

  const addCard = () => {
    if (!newCardText || !currentDeckId) return
    setDecks(decks.map(d => d.id === currentDeckId ? { ...d, cards: [...d.cards, newCardText] } : d))
    setNewCardText("")
  }

  const shuffleDeck = () => {
    if (!currentDeck) return
    const shuffled = [...currentDeck.cards].sort(() => Math.random() - 0.5)
    setDecks(decks.map(d => d.id === currentDeckId ? { ...d, cards: shuffled } : d))
    setDisplayIndex(0)
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-zinc-950 text-zinc-50">
      <h1 className="text-xl font-bold mb-8 tracking-tighter opacity-50">CONVERSATION DECK</h1>

      <Tabs defaultValue="play" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-900">
          <TabsTrigger value="play">演武（Play）</TabsTrigger>
          <TabsTrigger value="manage">編纂（Manage）</TabsTrigger>
        </TabsList>

        <TabsContent value="play" className="space-y-4 py-4">
          <div className="flex gap-2">
            <select 
              value={currentDeckId} 
              onChange={(e) => { setCurrentDeckId(e.target.value); setDisplayIndex(0); }}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md p-2 text-sm"
            >
              {decks.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <Button variant="outline" size="icon" onClick={shuffleDeck} className="border-zinc-800 bg-zinc-900">
              <Shuffle className="h-4 w-4" />
            </Button>
          </div>

          <Card className={`border-zinc-800 bg-zinc-900 shadow-2xl transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`}>
            <CardContent className="py-20 flex items-center justify-center min-h-[240px]">
              <p className="text-2xl font-bold text-center leading-relaxed px-4">
                {currentDeck?.cards[displayIndex] || "カードがありませんわ"}
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center gap-4 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsFlipped(!isFlipped)}
              className="border-zinc-800 bg-zinc-900"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> 向きを反転
            </Button>
            <Button 
              onClick={() => setDisplayIndex(prev => (prev + 1) % (currentDeck?.cards.length || 1))}
              className="flex-1 bg-zinc-100 text-zinc-900 hover:bg-zinc-300 font-bold"
            >
              次の話題へ
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6 py-4">
          <div className="flex gap-2">
            <Input placeholder="新デッキ名" value={newDeckName} onChange={(e) => setNewDeckName(e.target.value)} className="bg-zinc-900 border-zinc-800" />
            <Button onClick={addDeck}>作成</Button>
          </div>
          {currentDeck && (
            <div className="space-y-4 border-t border-zinc-800 pt-4">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-zinc-400">編集中のデッキ: {currentDeck.name}</h2>
              </div>
              <div className="flex gap-2">
                <Input placeholder="新しい話題を追加" value={newCardText} onChange={(e) => setNewCardText(e.target.value)} className="bg-zinc-900 border-zinc-800" />
                <Button onClick={addCard} variant="secondary">追加</Button>
              </div>
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {currentDeck.cards.map((c, i) => (
                  <li key={i} className="text-sm p-3 bg-zinc-900 rounded border border-zinc-800">{c}</li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  )
}