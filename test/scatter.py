import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

df = pd.read_csv("../assets/data/run_2belts.csv")

plt.scatter(df['Copx2'],df['Copy2'])
plt.scatter(df['Copx1'],df['Copy1'])
plt.show()
