import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

df = pd.read_csv("./old_data/run_2belts.csv")


plt.scatter(df['Copx1'],df['Copy1'])
plt.show()
