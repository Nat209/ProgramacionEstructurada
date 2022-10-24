"""Requerimientos
1. La palabra a divinar se debe seleccionar aleatoriamente del listado disponible en un archivo de texto. 
2. El jugador tendra 5 turnos para adivinar la palabra, (independientemente si en cada jugada tiene un acierto o un fallo).
3. En cada turno:
- Se debe mostrar al usuario la actualización de la palabra que esta intentando adivinar y el alfabeto actualizado (es decir, las letras que se encuentrar disponibles).
- Se debe preguntar al usuario si desea adivinar la palabra y de ser asi realizar la verificación correspondiente.

4. El juego termina:
-Cuando se completa los 5 turnos y el jugador no acierta.
-El jugador decide adivinar la palabra y acierta.
""" 

import random

#alfabeto = "a b c d e f g h i j k l m n ñ o p q r s t u v w x y z"

# Función para escoger una palabra random-nombre de la funcion los parentes.
def seleccionarpalabra() :
  lineas = open("frutas_verduras.txt").readlines()
  palabra = random.choice(lineas).rstrip()
  return palabra

#Funcion entrada del teclado
def entradausuario():
  letra =input("Introduzca una letra:")
  return letra.lower()

#Funcion actualizar jugada
def actualizarjugada (palabra, letra, jugada):
  n_letras = len(palabra)

  for i in range (0, n_letras):
    if palabra [i] == letra:
      jugada[i] = letra
      
  return jugada



#Actualizar el alfabeto
def actualizaralfabeto(letra, alfabeto):
  alfabeto = alfabeto.replace(letra, " ")
  return alfabeto



#Imprimir resultado de la jugada en la pantalla

def imprimiractualizacion(alfabeto, jugada):
  print(f"Jugada:{jugada}\n")
  print(f"letras disponibles: {alfabeto}")



#Verificar jugada
def verificarjugada(suposicion, palabra):
  success = False
  if suposicion == palabra:
    success = True
  return success

  

