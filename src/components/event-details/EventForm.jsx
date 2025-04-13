              <FormLabel>Orçamento total</FormLabel>
              <Input
                placeholder="Orçamento total em R$"
                value={budget}
                onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Notas</FormLabel>
              <Textarea
                placeholder="Notas adicionais sobre o evento"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div> 